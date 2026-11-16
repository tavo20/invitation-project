import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { activarEvento, borrarLlave } from '../../shared/evento-access/evento-access';
import { downloadDataUrl, galleryQrDataUrl } from '../../galeria/services/galeria-qr';

interface EventoNovios {
  id_invitacion: string;
  nombre: string;
  tipo: string;
  fecha: string | null;
  lugar: string;
  modulos: { invitacion: boolean; galeria: boolean; musica: boolean };
  organizador: { nombre: string; img: string | null; marcaBlanca?: boolean } | null;
  confirmaciones: { confirmados: number; pendientes: number; cancelados: number; respuestas: number } | null;
  mesas: { total: number; puestos: number; sentados: number; sinMesa: number; conCapitan?: number } | null;
  links: Record<string, string | null | undefined>;
}

const FONTS = 'https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400;500&family=Cormorant+Garamond:ital,wght@1,400;1,500;1,600&display=swap';
const fechaFmt = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' });

/** Página de los novios: todo su evento desde un solo link con llave. */
@Component({
  selector: 'app-novios-hub',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './novios-hub.component.html',
  styleUrl: './novios-hub.component.scss',
})
export class NoviosHubComponent implements OnInit {
  @Input({ required: true }) idInvitacion!: string;
  /** Avisa al padre si la llave ya no sirve, para mostrar la vista sin llave. */
  @Output() llaveInvalida = new EventEmitter<void>();

  private readonly http = inject(HttpClient);
  private readonly doc = inject(DOCUMENT);
  private readonly title = inject(Title);

  ev: EventoNovios | null = null;
  cargando = true;
  error = '';
  copiado = '';
  qr: Record<string, string> = {};
  private timer?: ReturnType<typeof setTimeout>;

  async ngOnInit(): Promise<void> {
    if (!this.doc.querySelector(`link[href="${FONTS}"]`)) {
      const l = this.doc.createElement('link');
      l.rel = 'stylesheet';
      l.href = FONTS;
      this.doc.head.appendChild(l);
    }
    activarEvento(this.idInvitacion);
    await this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando = true;
    this.error = '';
    try {
      const r = await lastValueFrom(
        this.http.get<{ success: boolean; data: EventoNovios; message?: string }>(
          `${environment.apiUrl}api/novios/${encodeURIComponent(this.idInvitacion)}`,
        ),
      );
      this.ev = r.data;
      this.title.setTitle(`${this.ev.nombre} · Tu evento`);
      this.prepararQrs();
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 401) {
        borrarLlave(this.idInvitacion);
        this.llaveInvalida.emit();
        return;
      }
      this.error = e instanceof HttpErrorResponse && e.status === 0
        ? 'No hay conexión. Revisa tu internet e intenta de nuevo.'
        : 'No pudimos cargar tu evento. Intenta de nuevo en un momento.';
    } finally {
      this.cargando = false;
    }
  }

  // ===== Formatos =====

  get fecha(): string {
    return this.ev?.fecha ? fechaFmt.format(new Date(this.ev.fecha)) : '';
  }

  get faltan(): string {
    if (!this.ev?.fecha) return '';
    const d = new Date(this.ev.fecha);
    const n = new Date();
    const dias = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime()) / 86400000);
    if (dias === 0) return '¡Es hoy!';
    if (dias === 1) return 'Es mañana';
    if (dias > 1) return `Faltan ${dias} días`;
    return '';
  }

  link(k: string): string | null {
    return (this.ev?.links[k] as string) || null;
  }

  tiene(k: string): boolean {
    return this.ev?.links[k] !== undefined;
  }

  // ===== Acciones =====

  async copiar(k: string): Promise<void> {
    const u = this.link(k);
    if (!u) return;
    try {
      await navigator.clipboard.writeText(u);
    } catch {
      window.prompt('Copia este link:', u);
    }
    this.copiado = k;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => (this.copiado = ''), 1800);
  }

  descargarQr(k: string, nombre: string): void {
    if (this.qr[k]) downloadDataUrl(this.qr[k], `qr-${nombre}-${this.idInvitacion}.png`);
  }

  private prepararQrs(): void {
    for (const k of ['galeria', 'musica']) {
      const u = this.link(k);
      if (u) galleryQrDataUrl(u, 768).then(d => (this.qr[k] = d)).catch(() => undefined);
    }
  }
}
