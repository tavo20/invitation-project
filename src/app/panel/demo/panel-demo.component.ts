import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PanelAuthService } from '../panel-auth.service';
import { ensurePanelFonts } from '../panel-fonts';

/** /panel/demo: abre la demo pública del panel sin correo ni contraseña. */
@Component({
  selector: 'app-panel-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="pd">
      <div class="pd-card" aria-live="polite">
        <ng-container *ngIf="!error">
          <span class="spin" aria-hidden="true"></span>
          <h1>Abriendo la <i>demo…</i></h1>
          <p>Un panel de ejemplo con bodas reales de muestra. Puedes tocar todo.</p>
        </ng-container>
        <ng-container *ngIf="error">
          <h1>No pudimos abrir <i>la demo.</i></h1>
          <p>{{ error }}</p>
          <button type="button" (click)="entrar()">Intentar de nuevo</button>
        </ng-container>
      </div>
    </main>
  `,
  styles: [`
    :host { display:block; min-height:100vh; background:#0E0B12; color:#F3EEF2; font-family:"Geist",system-ui,sans-serif; color-scheme:dark }
    .pd { min-height:100vh; display:grid; place-items:center; padding-left:max(16px,env(safe-area-inset-left,0px)); padding-right:max(16px,env(safe-area-inset-right,0px)) }
    .pd-card { max-width:420px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:14px }
    h1 { margin:0; font:600 32px/1.1 "Geist",system-ui,sans-serif; letter-spacing:-.03em }
    h1 i { font-family:"Cormorant Garamond",Georgia,serif; font-weight:500; color:#E8B4A0 }
    p { margin:0; color:#D5CAD4; line-height:1.5 }
    button { margin-top:8px; padding:14px 22px; border:0; border-radius:999px; background:#F3EEF2; color:#0E0B12; font:600 15px/1 "Geist",system-ui,sans-serif; cursor:pointer }
    .spin { width:28px; height:28px; border-radius:50%; border:2px solid rgba(232,180,160,.25); border-top-color:#E8B4A0; animation:spin .8s linear infinite }
    @keyframes spin { to { transform:rotate(360deg) } }
    @media (prefers-reduced-motion: reduce) { .spin { animation:none } }
  `],
})
export class PanelDemoComponent implements OnInit {
  private readonly auth = inject(PanelAuthService);
  private readonly router = inject(Router);
  error = '';

  constructor() {
    ensurePanelFonts(inject(DOCUMENT));
    inject(Title).setTitle('Demo · Panel de eventos');
  }

  ngOnInit(): void {
    void this.entrar();
  }

  async entrar(): Promise<void> {
    this.error = '';
    try {
      // Si ya está en la demo, entra directo
      if (!(this.auth.isLoggedIn() && this.auth.cliente()?.demo)) await this.auth.entrarDemo();
      await this.router.navigate(['/panel'], { replaceUrl: true });
    } catch (e) {
      this.error = (e as Error).message;
    }
  }
}
