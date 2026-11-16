import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelLinks } from '../panel.models';

interface LinkItem {
  key: keyof PanelLinks;
  titulo: string;
  ayuda: string;
  privado?: boolean;
}

const PARA_INVITADOS: LinkItem[] = [
  { key: 'invitacion', titulo: 'Invitación', ayuda: 'El link que reciben los invitados.' },
  { key: 'confirmacion', titulo: 'Confirmar asistencia', ayuda: 'Directo al formulario, por si alguien no lo encuentra.' },
  { key: 'galeria', titulo: 'Subir fotos', ayuda: 'Para compartir durante el evento.' },
  { key: 'musica', titulo: 'Pedir canciones', ayuda: 'Los invitados piden y votan canciones.' },
];

const PARA_NOVIOS: LinkItem[] = [
  { key: 'novios', titulo: 'Link para los novios', ayuda: 'Un solo link con todo su evento: invitación, confirmaciones, mesas, fotos y música.', privado: true },
];


/** Lista de links del evento con botón de copiar y de abrir. */
@Component({
  selector: 'app-panel-links',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel-links.component.html',
  styleUrl: './panel-links.component.scss',
})
export class PanelLinksComponent {
  @Input({ required: true }) links!: PanelLinks;

  copiado = '';
  private timer?: ReturnType<typeof setTimeout>;

  readonly grupos = [
    { titulo: 'Para los novios', nota: 'Mándales solo este link: desde ahí ven y organizan todo (invitación, confirmaciones, mesas, fotos y música). Tú también puedes abrirlo.', items: PARA_NOVIOS },
    { titulo: 'Para tus invitados', nota: 'Compártelos por WhatsApp o redes.', items: PARA_INVITADOS },
  ];

  /** Solo muestra los links que existen en este evento (fotos y música dependen del plan). */
  visibles(items: LinkItem[]): LinkItem[] {
    return items.filter(i => this.links[i.key] !== undefined);
  }

  url(i: LinkItem): string | null {
    return (this.links[i.key] as string | null) ?? null;
  }

  corto(u: string): string {
    return u.replace(/^https?:\/\/(www\.)?/, '').replace(/\?(token|k)=.*/, '?$1=•••');
  }

  async copiar(i: LinkItem, input: HTMLInputElement): Promise<void> {
    const u = this.url(i);
    if (!u) return;
    try {
      await navigator.clipboard.writeText(u);
    } catch {
      // Sin permiso de portapapeles: deja el link seleccionado para copiarlo a mano
      input.hidden = false;
      input.select();
    }
    this.copiado = i.key;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => (this.copiado = ''), 1800);
  }
}
