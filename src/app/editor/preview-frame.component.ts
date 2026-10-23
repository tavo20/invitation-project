import { Component, HostListener, OnInit, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EDITABLE_TEMPLATES } from './template-schemas';

export const PREVIEW_MESSAGE = 'invitation-editor-preview';
export const PREVIEW_READY = 'invitation-editor-preview-ready';
export const PREVIEW_SCROLL = 'invitation-editor-preview-scroll';

/**
 * Vista previa del editor: /invitation/vista-previa, cargada dentro de un iframe.
 * Así la plantilla mide sus vw/vh y sus elementos fijos contra el "teléfono" y no contra la ventana.
 * Solo acepta mensajes de la misma app.
 */
@Component({
  selector: 'app-preview-frame',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="component"
      [ngComponentOutlet]="component"
      [ngComponentOutletInputs]="{ invitationData: data }"
    ></ng-container>
  `,
})
export class PreviewFrameComponent implements OnInit {
  component: Type<unknown> | null = null;
  data: Record<string, unknown> = {};

  ngOnInit(): void {
    window.parent?.postMessage({ type: PREVIEW_READY }, window.location.origin);
  }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent): void {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === PREVIEW_MESSAGE) {
      this.component = EDITABLE_TEMPLATES[event.data.template]?.component ?? null;
      this.data = event.data.data ?? {};
    } else if (event.data?.type === PREVIEW_SCROLL && typeof event.data.selector === 'string') {
      // después del render, por si la sección acaba de aparecer (toggle encendido)
      setTimeout(() => {
        document.querySelector(event.data.selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }
}
