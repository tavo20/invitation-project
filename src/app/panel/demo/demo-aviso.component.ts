import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelAuthService } from '../panel-auth.service';

/** Franja que avisa que es la demo, con el contacto para tener un panel propio. */
@Component({
  selector: 'app-demo-aviso',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="da" *ngIf="auth.cliente()?.demo" role="note">
      <span><b>Estás viendo una demo.</b> Toca todo con confianza: esta noche vuelve a quedar como nueva.</span>
      <a href="https://wa.me/573218581771" target="_blank" rel="noopener">Quiero mi panel con mi marca ↗</a>
    </aside>
  `,
  styles: [`
    .da { display:flex; justify-content:space-between; align-items:center; gap:10px 16px; flex-wrap:wrap;
      margin-top:14px; padding:12px 16px; border-radius:16px;
      background:linear-gradient(120deg, rgba(232,180,160,.18), rgba(150,80,140,.22)); border:1px solid rgba(232,180,160,.35);
      font:400 14px/1.45 "Geist",system-ui,sans-serif; color:#F3EEF2 }
    .da b { font-weight:600 }
    .da a { flex:none; padding:9px 14px; border-radius:999px; background:#F3EEF2; color:#0E0B12; font-weight:600; font-size:13px; text-decoration:none }
  `],
})
export class DemoAvisoComponent {
  readonly auth = inject(PanelAuthService);
}
