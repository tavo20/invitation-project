import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-warm-plantilla',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './warm-plantilla.component.html',
  styleUrl: './warm-plantilla.component.scss'
})
export class WarmPlantillaComponent {
  // Colores cálidos personalizables
  primaryColor: string = '#ff6b35';    // Naranja cálido
  secondaryColor: string = '#f7931e';  // Ámbar dorado
  accentColor: string = '#c9485b';     // Rosa coral

  constructor() {
    this.applyColors();
  }

  applyColors() {
    document.documentElement.style.setProperty('--warm-primary', this.primaryColor);
    document.documentElement.style.setProperty('--warm-secondary', this.secondaryColor);
    document.documentElement.style.setProperty('--warm-accent', this.accentColor);
  }

  // Método para cambiar colores dinámicamente
  changeColors(primary: string, secondary: string, accent: string) {
    this.primaryColor = primary;
    this.secondaryColor = secondary;
    this.accentColor = accent;
    this.applyColors();
  }
}
