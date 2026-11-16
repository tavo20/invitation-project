import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PanelAuthService } from '../panel-auth.service';
import { PanelEventosService } from '../panel-eventos.service';
import { PanelEventoCard, PanelEventosResponse, TipoEvento } from '../panel.models';
import { ensurePanelFonts } from '../panel-fonts';
import { MarcaLogoComponent } from '../../shared/marca/marca-logo.component';

type Filtro = 'proximos' | 'pasados' | 'archivados';

const TIPO_LABEL: Record<TipoEvento, string> = {
  boda: 'Boda', xv: 'XV años', cumpleanos: 'Cumpleaños', bautizo: 'Bautizo', otro: 'Evento',
};
const PLANTILLA_LABEL: Record<string, string> = { neblina: 'Neblina', xyz: 'Flow' };
const DIA = 86400000;

const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const fechaFmt = new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

/** Inicio del panel: lista de eventos del cliente y lo que tiene por pagar. */
@Component({
  selector: 'app-panel-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, MarcaLogoComponent],
  templateUrl: './panel-inicio.component.html',
  styleUrl: './panel-inicio.component.scss',
})
export class PanelInicioComponent implements OnInit {
  readonly auth = inject(PanelAuthService);
  private readonly eventosSvc = inject(PanelEventosService);
  private readonly router = inject(Router);

  cargando = true;
  error = '';
  data: PanelEventosResponse | null = null;
  filtro: Filtro = 'proximos';

  constructor() {
    ensurePanelFonts(inject(DOCUMENT));
    inject(Title).setTitle(this.auth.titulo('Mis eventos'));
  }

  ngOnInit(): void {
    this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando = true;
    this.error = '';
    try {
      this.data = await this.eventosSvc.listar();
      // Si no hay próximos pero sí pasados, abre directo en pasados
      if (!this.lista('proximos').length && this.lista('pasados').length) this.filtro = 'pasados';
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

  // ===== Listas =====

  lista(f: Filtro): PanelEventoCard[] {
    const eventos = this.data?.eventos || [];
    const hoy = this.inicioDeHoy();
    const esPasado = (e: PanelEventoCard) => !!e.fecha && new Date(e.fecha).getTime() < hoy;
    if (f === 'archivados') return eventos.filter(e => e.estado === 'archivado');
    const activos = eventos.filter(e => e.estado !== 'archivado');
    if (f === 'pasados') {
      return activos.filter(esPasado).sort((a, b) => +new Date(b.fecha!) - +new Date(a.fecha!));
    }
    // Próximos: primero los que tienen fecha (el más cercano arriba), luego los que aún no tienen fecha
    return activos.filter(e => !esPasado(e)).sort((a, b) => {
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      return +new Date(a.fecha) - +new Date(b.fecha);
    });
  }

  get visibles(): PanelEventoCard[] {
    return this.lista(this.filtro);
  }

  // ===== Resumen =====

  get proximos30(): number {
    const hoy = this.inicioDeHoy();
    return this.lista('proximos').filter(e => e.fecha && +new Date(e.fecha) - hoy <= 30 * DIA).length;
  }

  get confirmadosProximos(): number {
    return this.lista('proximos').reduce((t, e) => t + (e.confirmaciones?.confirmados || 0), 0);
  }

  get porPagar(): string {
    return cop.format(this.data?.cuenta.porPagar || 0);
  }

  get eventosPorPagar(): number {
    return (this.data?.eventos || []).filter(e => e.cobro.estado === 'pendiente').length;
  }

  // ===== Formatos para las tarjetas =====

  tipo(e: PanelEventoCard): string {
    return TIPO_LABEL[e.tipo] || 'Evento';
  }

  plantilla(e: PanelEventoCard): string {
    return e.plantilla ? PLANTILLA_LABEL[e.plantilla] || e.plantilla : '';
  }

  fecha(e: PanelEventoCard): string {
    return e.fecha ? fechaFmt.format(new Date(e.fecha)) : 'Sin fecha';
  }

  cuenta(e: PanelEventoCard): { texto: string; tono: 'hoy' | 'pronto' | 'normal' | 'pasado' | 'nada' } {
    if (!e.fecha) return { texto: 'Agrega la fecha', tono: 'nada' };
    const d = new Date(e.fecha);
    const dias = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - this.inicioDeHoy()) / DIA);
    if (dias === 0) return { texto: 'Es hoy', tono: 'hoy' };
    if (dias === 1) return { texto: 'Mañana', tono: 'pronto' };
    if (dias > 1) return { texto: `Faltan ${dias} días`, tono: dias <= 14 ? 'pronto' : 'normal' };
    return { texto: dias === -1 ? 'Fue ayer' : `Hace ${-dias} días`, tono: 'pasado' };
  }

  planNombre(e: PanelEventoCard): string {
    return e.cobro.plan === 'completa' ? 'Completa' : e.cobro.plan === 'fiesta' ? 'Fiesta' : 'Invitación';
  }

  precio(e: PanelEventoCard): string {
    return cop.format(e.cobro.precio);
  }

  cobro(e: PanelEventoCard): string {
    return e.cobro.estado === 'pagado' ? 'Pagado' : e.cobro.estado === 'cortesia' ? 'Cortesía' : 'Por pagar';
  }

  trackId = (_: number, e: PanelEventoCard) => e._id;

  // ===== Sesión =====

  get primerNombre(): string {
    return this.auth.cliente()?.nombre?.split(' ')[0] || '';
  }

  salir(): void {
    const ruta = this.auth.rutaIngreso();
    this.auth.logout();
    this.router.navigate(ruta);
  }

  private inicioDeHoy(): number {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
  }
}
