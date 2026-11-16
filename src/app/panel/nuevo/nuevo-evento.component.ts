import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PanelAuthService } from '../panel-auth.service';
import { PanelEventosService } from '../panel-eventos.service';
import { PanelLinksComponent } from '../links/panel-links.component';
import { PanelCatalogo, PanelEventoCreado, PlanEvento, TipoEvento } from '../panel.models';
import { ensurePanelFonts } from '../panel-fonts';
import { MarcaLogoComponent } from '../../shared/marca/marca-logo.component';

type Paso = 1 | 2 | 3 | 4;

export const PAQUETES: { key: PlanEvento; nombre: string; resumen: string; incluye: string[] }[] = [
  { key: 'invitacion', nombre: 'Invitación', resumen: 'La invitación digital y la organización de invitados.', incluye: ['Invitación con editor', 'Confirmación de asistencia y lista', 'Mesas y puestos'] },
  { key: 'fiesta', nombre: 'Fiesta', resumen: 'Para quien ya tiene invitación y quiere vivir la fiesta.', incluye: ['App de fotos: álbum privado con las fotos de los invitados', 'App de música: piden canciones y el DJ las recibe'] },
  { key: 'completa', nombre: 'Completa', resumen: 'Todo en un solo link, de la invitación a la pista.', incluye: ['Todo lo de Invitación', 'Todo lo de Fiesta'] },
];

const TIPOS: { key: TipoEvento; label: string }[] = [
  { key: 'boda', label: 'Boda' },
  { key: 'xv', label: 'XV años' },
  { key: 'cumpleanos', label: 'Cumpleaños' },
  { key: 'bautizo', label: 'Bautizo' },
  { key: 'otro', label: 'Otro' },
];

const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

@Component({
  selector: 'app-panel-nuevo-evento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PanelLinksComponent, MarcaLogoComponent],
  templateUrl: './nuevo-evento.component.html',
  styleUrl: './nuevo-evento.component.scss',
})
export class NuevoEventoComponent implements OnInit {
  readonly auth = inject(PanelAuthService);
  private readonly eventos = inject(PanelEventosService);
  private readonly router = inject(Router);

  readonly tipos = TIPOS;
  readonly paquetes = PAQUETES;

  paso: Paso = 1;
  catalogo: PanelCatalogo | null = null;
  cargandoCatalogo = true;
  creando = false;
  error = '';
  creado: PanelEventoCreado | null = null;

  // Formulario
  tipo: TipoEvento = 'boda';
  nombreA = '';
  nombreB = '';
  nombre = '';
  nombreEditado = false;
  fecha = '';
  hora = '';
  lugar = '';
  plantilla = '';
  paquete: PlanEvento = 'completa';

  constructor() {
    ensurePanelFonts(inject(DOCUMENT));
    inject(Title).setTitle(this.auth.titulo('Crear evento'));
  }

  async ngOnInit(): Promise<void> {
    try {
      this.catalogo = await this.eventos.catalogo();
      this.plantilla = this.catalogo.plantillas[0]?.key || '';
    } catch (e) {
      if (!this.auth.isLoggedIn()) {
        this.router.navigate(this.auth.rutaIngreso());
        return;
      }
      this.error = (e as Error).message;
    } finally {
      this.cargandoCatalogo = false;
    }
  }

  // ===== Paso 1: datos =====

  get esPareja(): boolean {
    return this.tipo === 'boda';
  }

  get etiquetaA(): string {
    return this.esPareja ? 'Nombre de uno de los novios' : this.tipo === 'xv' ? 'Nombre de la quinceañera' : 'Nombre del festejado';
  }

  /** Mientras no lo edite a mano, el nombre del evento se arma con los nombres. */
  onNombres(): void {
    if (this.nombreEditado) return;
    const a = this.nombreA.trim();
    const b = this.nombreB.trim();
    if (this.esPareja) this.nombre = a && b ? `${a} & ${b}` : a || b;
    else if (this.tipo === 'xv') this.nombre = a ? `Mis XV · ${a}` : '';
    else this.nombre = a;
  }

  onTipo(t: TipoEvento): void {
    this.tipo = t;
    if (!this.esPareja) this.nombreB = '';
    this.onNombres();
  }

  get minFecha(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private validarPaso1(): string {
    if (!this.nombreA.trim()) return this.esPareja ? 'Escribe el nombre de al menos uno de los novios' : 'Escribe el nombre del festejado';
    if (this.nombre.trim().length < 3) return 'Escribe el nombre del evento';
    if (this.fecha && this.fecha < this.minFecha) return 'La fecha ya pasó. Revisa el día del evento';
    return '';
  }

  // ===== Navegación =====

  /** Con el paquete Fiesta no hay invitación: el asistente termina en el paso 2. */
  get conInvitacion(): boolean {
    return this.paquete !== 'fiesta';
  }

  get pasos(): string[] {
    return this.conInvitacion ? ['Datos', 'Paquete', 'Invitación'] : ['Datos', 'Paquete'];
  }

  get esUltimo(): boolean {
    return this.paso === this.pasos.length;
  }

  siguiente(): void {
    this.error = '';
    if (this.paso === 1) {
      const msg = this.validarPaso1();
      if (msg) {
        this.error = msg;
        return;
      }
    }
    if (this.paso < this.pasos.length) this.paso = (this.paso + 1) as Paso;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  atras(): void {
    this.error = '';
    if (this.paso > 1 && this.paso < 4) this.paso = (this.paso - 1) as Paso;
  }

  irA(p: Paso): void {
    if (p < this.paso && this.paso < 4) {
      this.error = '';
      this.paso = p;
    }
  }

  // ===== Paquete, resumen y crear =====

  precio(plan: PlanEvento): string {
    return this.catalogo ? cop.format(this.catalogo.precios[plan]) : '';
  }

  get nombrePlantilla(): string {
    return this.catalogo?.plantillas.find(p => p.key === this.plantilla)?.nombre || '';
  }

  get fechaResumen(): string {
    if (!this.fecha) return 'Sin fecha por ahora';
    const d = new Date(`${this.fecha}T${this.hora || '12:00'}`);
    const f = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    return this.hora ? `${f}, ${this.hora}` : f;
  }

  async crear(): Promise<void> {
    if (this.creando) return;
    this.error = '';
    const msg = this.validarPaso1();
    if (msg) {
      this.paso = 1;
      this.error = msg;
      return;
    }
    if (this.conInvitacion && !this.plantilla) {
      this.error = 'Elige una plantilla';
      return;
    }
    this.creando = true;
    try {
      this.creado = await this.eventos.crear({
        nombre: this.nombre.trim(),
        tipo: this.tipo,
        fecha: this.fecha ? new Date(`${this.fecha}T${this.hora || '18:00'}`).toISOString() : null,
        lugar: this.lugar.trim(),
        nombres: { a: this.nombreA.trim(), b: this.nombreB.trim() },
        plantilla: this.conInvitacion ? this.plantilla : '',
        paquete: this.paquete,
      });
      this.paso = 4;
      window.scrollTo({ top: 0 });
    } catch (e) {
      if (!this.auth.isLoggedIn()) {
        this.router.navigate(this.auth.rutaIngreso());
        return;
      }
      this.error = (e as Error).message;
    } finally {
      this.creando = false;
    }
  }
}
