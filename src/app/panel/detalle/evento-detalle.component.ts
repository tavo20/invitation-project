import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PanelAuthService } from '../panel-auth.service';
import { PanelEventosService } from '../panel-eventos.service';
import { PanelLinksComponent } from '../links/panel-links.component';
import { ConfirmationsListComponent } from '../../confirmation/confirmations-list/confirmations-list.component';
import { MesasComponent } from '../../confirmation/mesas/mesas.component';
import { PanelConfirmacion, PanelEventoDetalle, TipoEvento } from '../panel.models';
import { ensurePanelFonts } from '../panel-fonts';
import { MarcaLogoComponent } from '../../shared/marca/marca-logo.component';
import { DemoAvisoComponent } from '../demo/demo-aviso.component';

type Tab = 'confirmaciones' | 'mesas' | 'links';

const TIPO_LABEL: Record<TipoEvento, string> = {
  boda: 'Boda', xv: 'XV años', cumpleanos: 'Cumpleaños', bautizo: 'Bautizo', otro: 'Evento',
};
const PLANTILLA_LABEL: Record<string, string> = { neblina: 'Neblina', xyz: 'Flow' };
const DIA = 86400000;
const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const fechaLarga = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' });

@Component({
  selector: 'app-panel-evento-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PanelLinksComponent, ConfirmationsListComponent, MesasComponent, MarcaLogoComponent, DemoAvisoComponent],
  templateUrl: './evento-detalle.component.html',
  styleUrl: './evento-detalle.component.scss',
})
export class EventoDetalleComponent implements OnInit {
  readonly auth = inject(PanelAuthService);
  private readonly eventos = inject(PanelEventosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);

  id = '';
  ev: PanelEventoDetalle | null = null;
  cargando = true;
  error = '';
  tab: Tab = 'confirmaciones';

  // Pasar a Completa
  precioCompleta: number | null = null;
  plantillas: { key: string; nombre: string; descripcion: string }[] = [];
  plantillaUpgrade = '';
  confirmandoUpgrade = false;
  activando = false;
  errorUpgrade = '';

  // Editar datos
  editando = false;
  guardando = false;
  errorEdit = '';
  fNombre = '';
  fFecha = '';
  fHora = '';
  fLugar = '';

  constructor() {
    ensurePanelFonts(inject(DOCUMENT));
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    const t = this.route.snapshot.queryParamMap.get('tab');
    if (t === 'mesas' || t === 'links' || t === 'confirmaciones') this.tab = t;
    this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando = true;
    this.error = '';
    try {
      this.ev = await this.eventos.detalle(this.id);
      this.title.setTitle(this.auth.titulo(this.ev.nombre));
      if (!this.ev.modulos.invitacion && this.tab !== 'links') this.tab = 'links';
      if (!this.ev.modulos.galeria || !this.ev.modulos.invitacion) {
        this.eventos.catalogo().then(c => {
          this.precioCompleta = c.precios.completa;
          this.plantillas = c.plantillas;
          this.plantillaUpgrade = c.plantillas[0]?.key || '';
        }).catch(() => (this.precioCompleta = null));
      }
    } catch (e) {
      if (!this.auth.isLoggedIn()) {
        this.router.navigate(this.auth.rutaIngreso());
        return;
      }
      this.error = (e as Error).message;
    } finally {
      this.cargando = false;
    }
  }

  setTab(t: Tab): void {
    if (t === this.tab) return;
    this.tab = t;
    this.router.navigate([], { queryParams: { tab: t }, replaceUrl: true });
    // Lo editado en confirmaciones o mesas actualiza las cifras de arriba
    void this.refrescar();
  }

  /** Recarga los datos sin mostrar la carga (para actualizar las cifras del encabezado). */
  private async refrescar(): Promise<void> {
    try {
      const d = await this.eventos.detalle(this.id);
      if (this.ev) this.ev = { ...this.ev, confirmaciones: d.confirmaciones, lista: d.lista, mesas: d.mesas };
    } catch { /* se queda con lo que tenía */ }
  }

  // ===== Encabezado =====

  get tipo(): string {
    return this.ev ? TIPO_LABEL[this.ev.tipo] || 'Evento' : '';
  }

  get plantilla(): string {
    return this.ev?.plantilla ? PLANTILLA_LABEL[this.ev.plantilla] || this.ev.plantilla : '';
  }

  get fecha(): string {
    return this.ev?.fecha ? fechaLarga.format(new Date(this.ev.fecha)) : 'Sin fecha';
  }

  get cuenta(): { texto: string; tono: string } {
    if (!this.ev?.fecha) return { texto: 'Agrega la fecha', tono: 'nada' };
    const d = new Date(this.ev.fecha);
    const n = new Date();
    const dias = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime()) / DIA);
    if (dias === 0) return { texto: 'Es hoy', tono: 'hoy' };
    if (dias === 1) return { texto: 'Mañana', tono: 'pronto' };
    if (dias > 1) return { texto: `Faltan ${dias} días`, tono: dias <= 14 ? 'pronto' : 'normal' };
    return { texto: dias === -1 ? 'Fue ayer' : `Hace ${-dias} días`, tono: 'pasado' };
  }

  get precio(): string {
    return this.ev ? cop.format(this.ev.cobro.precio) : '';
  }

  get cobro(): string {
    const s = this.ev?.cobro.estado;
    return s === 'pagado' ? 'Pagado' : s === 'cortesia' ? 'Cortesía' : 'Por pagar';
  }

  // ===== Confirmaciones =====

  get respuestas(): PanelConfirmacion[] {
    return (this.ev?.lista || []).filter(c => c.type !== 'hospedaje');
  }

  // ===== Pasar a Completa =====

  get precioUpgrade(): string {
    return this.precioCompleta != null ? cop.format(this.precioCompleta) : '';
  }

  get planNombre(): string {
    const p = this.ev?.cobro.plan;
    return p === 'completa' ? 'Completa' : p === 'fiesta' ? 'Fiesta' : 'Invitación';
  }

  /** Evento Fiesta: agrega la invitación y pasa a Completa. */
  async agregarInvitacion(): Promise<void> {
    if (!this.ev || this.activando) return;
    if (!this.plantillaUpgrade) {
      this.errorUpgrade = 'Elige una plantilla';
      return;
    }
    this.activando = true;
    this.errorUpgrade = '';
    try {
      const [a, b] = this.ev.nombre.split('&').map(x => x.trim());
      const r = await this.eventos.agregarInvitacion(this.ev._id, this.plantillaUpgrade, { a: a || '', b: b || '' });
      this.ev = { ...this.ev, modulos: r.modulos, cobro: r.cobro, links: r.links, plantilla: r.plantilla };
      this.confirmandoUpgrade = false;
      this.setTab('links');
    } catch (e) {
      this.errorUpgrade = (e as Error).message;
    } finally {
      this.activando = false;
    }
  }

  async activarExperiencia(): Promise<void> {
    if (!this.ev || this.activando) return;
    this.activando = true;
    this.errorUpgrade = '';
    try {
      const r = await this.eventos.activarExperiencia(this.ev._id);
      this.ev = { ...this.ev, modulos: r.modulos, cobro: r.cobro, links: r.links };
      this.confirmandoUpgrade = false;
      this.setTab('links');
    } catch (e) {
      this.errorUpgrade = (e as Error).message;
    } finally {
      this.activando = false;
    }
  }

  // ===== Editar datos =====

  abrirEdicion(): void {
    if (!this.ev) return;
    this.fNombre = this.ev.nombre;
    this.fLugar = this.ev.lugar || '';
    if (this.ev.fecha) {
      const d = new Date(this.ev.fecha);
      const p = (n: number) => String(n).padStart(2, '0');
      this.fFecha = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
      this.fHora = `${p(d.getHours())}:${p(d.getMinutes())}`;
    } else {
      this.fFecha = '';
      this.fHora = '';
    }
    this.errorEdit = '';
    this.editando = true;
  }

  async guardar(): Promise<void> {
    if (!this.ev || this.guardando) return;
    if (this.fNombre.trim().length < 3) {
      this.errorEdit = 'Escribe el nombre del evento';
      return;
    }
    this.guardando = true;
    this.errorEdit = '';
    try {
      const r = await this.eventos.actualizar(this.ev._id, {
        nombre: this.fNombre.trim(),
        lugar: this.fLugar.trim(),
        fecha: this.fFecha ? new Date(`${this.fFecha}T${this.fHora || '18:00'}`).toISOString() : null,
      });
      this.ev = { ...this.ev, nombre: r.nombre, lugar: r.lugar, fecha: r.fecha };
      this.title.setTitle(this.auth.titulo(this.ev.nombre));
      this.editando = false;
    } catch (e) {
      this.errorEdit = (e as Error).message;
    } finally {
      this.guardando = false;
    }
  }

  async archivar(archivar: boolean): Promise<void> {
    if (!this.ev || this.guardando) return;
    this.guardando = true;
    this.errorEdit = '';
    try {
      const r = await this.eventos.actualizar(this.ev._id, { estado: archivar ? 'archivado' : 'activo' });
      this.ev = { ...this.ev, estado: r.estado };
      this.editando = false;
    } catch (e) {
      this.errorEdit = (e as Error).message;
    } finally {
      this.guardando = false;
    }
  }
}
