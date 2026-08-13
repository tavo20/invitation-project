import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountDownComponent } from '../../shared/components/count-down/count-down.component';

@Component({
  selector: 'app-flow-plantilla',
  standalone: true,
  imports: [CommonModule, CountDownComponent],
  templateUrl: './flow-plantilla.component.html',
  styleUrl: './flow-plantilla.component.scss'
})
export class FlowPlantillaComponent {
  weddingDate = 'November 26, 2030 20:00:00';
}
