import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PanelAuthService } from '../panel-auth.service';
import { ensurePanelFonts } from '../panel-fonts';
import { MarcaLogoComponent } from '../../shared/marca/marca-logo.component';
import { Marca, MarcaService, SIN_MARCA } from '../../shared/marca/marca.service';

type Paso = 'ingresar' | 'clave';

@Component({
  selector: 'app-panel-ingresar',
  standalone: true,
  imports: [CommonModule, FormsModule, MarcaLogoComponent],
  templateUrl: './ingresar.component.html',
  styleUrl: './ingresar.component.scss',
})
export class IngresarComponent implements OnInit {
  private readonly auth = inject(PanelAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly marcas = inject(MarcaService);
  private readonly title = inject(Title);

  /** Marca del link de ingreso (/panel/ingresar/hilo-rojo). Sin marca: pantalla con InvitApp. */
  marca: Marca = SIN_MARCA;
  cargandoMarca = false;

  paso: Paso = 'ingresar';
  cargando = false;
  error = '';
  verClave = false;

  email = '';
  password = '';

  nuevaClave = '';
  confirmarClave = '';

  constructor() {
    ensurePanelFonts(inject(DOCUMENT));
    this.title.setTitle('Ingresar · Panel de eventos');
  }

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('mock')) this.auth.enableMock();

    const slug = this.route.snapshot.paramMap.get('marca');
    if (slug) {
      this.cargandoMarca = true;
      this.auth.recordarMarca(slug);
      this.marcas.porSlug(slug).then(m => {
        this.marca = m;
        if (m.marcaBlanca && m.nombre) this.title.setTitle(`Ingresar · ${m.nombre}`);
      }).finally(() => (this.cargandoMarca = false));
    }

    // Ya tiene sesión: si le falta cambiar la clave temporal, se queda en ese paso
    if (this.auth.isLoggedIn()) {
      if (this.auth.cliente()?.mustChangePassword) this.paso = 'clave';
      else this.router.navigate(['/panel']);
    }
  }

  get nombre(): string {
    return this.auth.cliente()?.nombre?.split(' ')[0] || '';
  }

  get claveCorta(): boolean {
    return !!this.nuevaClave && this.nuevaClave.length < 8;
  }

  get noCoinciden(): boolean {
    return !!this.confirmarClave && this.confirmarClave !== this.nuevaClave;
  }

  async ingresar(): Promise<void> {
    if (this.cargando) return;
    this.error = '';
    if (!this.email.trim() || !this.password) {
      this.error = 'Escribe tu correo y tu contraseña';
      return;
    }
    this.cargando = true;
    try {
      const s = await this.auth.login(this.email, this.password);
      if (s.cliente.mustChangePassword) {
        this.paso = 'clave';
      } else {
        await this.router.navigate(['/panel']);
      }
    } catch (e) {
      this.error = (e as Error).message;
    } finally {
      this.cargando = false;
    }
  }

  async guardarClave(): Promise<void> {
    if (this.cargando) return;
    this.error = '';
    if (this.nuevaClave.length < 8) {
      this.error = 'La nueva contraseña debe tener al menos 8 caracteres';
      return;
    }
    if (this.nuevaClave !== this.confirmarClave) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }
    if (this.nuevaClave === this.password) {
      this.error = 'Usa una contraseña distinta a la temporal';
      return;
    }
    this.cargando = true;
    try {
      // Si recargó la página no tenemos la temporal en memoria: se la pedimos
      await this.auth.changePassword(this.password, this.nuevaClave);
      this.password = '';
      await this.router.navigate(['/panel']);
    } catch (e) {
      this.error = (e as Error).message;
    } finally {
      this.cargando = false;
    }
  }

  salir(): void {
    this.auth.logout();
    this.paso = 'ingresar';
    this.password = '';
    this.nuevaClave = '';
    this.confirmarClave = '';
    this.error = '';
  }
}
