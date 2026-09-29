import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PartyService } from '../../services/party.service';

@Component({
  selector: 'app-dj-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dj-login.component.html',
  styleUrl: './dj-login.component.scss',
})
export class DjLoginComponent {
  mode: 'login' | 'register' = 'login';
  name = '';
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private partyService: PartyService, private router: Router) {
    if (this.partyService.isLoggedIn()) {
      this.router.navigate(['/dj/dashboard']);
    }
  }

  toggleMode(): void {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.error = '';
  }

  submit(): void {
    this.error = '';

    if (this.mode === 'register' && !this.name.trim()) {
      this.error = 'Escribe tu nombre';
      return;
    }
    if (!this.email.trim()) {
      this.error = 'Escribe tu correo';
      return;
    }
    if (!this.password) {
      this.error = 'Escribe tu contraseña';
      return;
    }

    this.loading = true;

    const obs = this.mode === 'login'
      ? this.partyService.login({ email: this.email.trim(), password: this.password })
      : this.partyService.register({ name: this.name.trim(), email: this.email.trim(), password: this.password });

    obs.subscribe({
      next: () => {
        debugger
        this.loading = false;
        this.router.navigate(['/dj/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Error al iniciar sesión';
      },
    });
  }
}
