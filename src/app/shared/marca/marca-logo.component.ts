import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Marca } from './marca.service';

/**
 * Logo de la marca visible:
 * - marca blanca con logo → el logo del planner
 * - marca blanca sin logo → el nombre del planner
 * - sin marca blanca → InvitApp
 * Hereda color y tipografía del contenedor (usa --marca-acento para el detalle en cursiva).
 */
@Component({
  selector: 'app-marca-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="marca?.marcaBlanca && marca?.nombre; else invitapp">
      <img *ngIf="marca!.img && !fallo; else texto" class="ml-img" [src]="marca!.img" [alt]="marca!.nombre" [style.height.px]="alto" (error)="fallo = true">
      <ng-template #texto><span class="ml-txt">{{ marca!.nombre }}</span></ng-template>
    </ng-container>
    <ng-template #invitapp><span class="ml-ia">Invit<i>App</i></span></ng-template>
  `,
  styles: [`
    :host { display: inline-flex; align-items: center; min-width: 0; }
    .ml-img { display: block; width: auto; max-width: 180px; object-fit: contain; }
    .ml-txt { font-weight: 600; letter-spacing: -.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ml-ia { font-weight: 600; letter-spacing: -.02em; }
    .ml-ia i { font-family: "Cormorant Garamond", Georgia, serif; font-style: italic; font-weight: 500; font-size: 1.2em; color: var(--marca-acento, #E8B4A0); }
  `],
})
export class MarcaLogoComponent {
  @Input() marca: Marca | null = null;
  /** Alto del logo en px. */
  @Input() alto = 32;
  fallo = false;
}
