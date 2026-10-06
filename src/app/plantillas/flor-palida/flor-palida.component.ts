import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FlorPalidaData {
  kicker: string[];
  names1: string;
  names2: string;
  weddingDate: string;
  saveTheDateLabel: string;
  flowerImage: string;
  // bienvenida
  greetingTitle: string;
  greetingLines: string[];
  waitingTitle: string;
  time: string;
  quote: string;
  // lugar
  venueTitle: string;
  venueLines: string[];
  mapButtonText: string;
  mapLink: string;
  // dress code
  dressTitle: string;
  dressText: string;
  dressColors: string[];
  // cierre
  closingTitle: string;
  closingTagline: string;
}

@Component({
  selector: 'app-flor-palida',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flor-palida.component.html',
  styleUrl: './flor-palida.component.scss'
})
export class FlorPalidaComponent {
  @Input() invitationData: Partial<FlorPalidaData> | null = null;
  @Input() confirmation: any = null;

  private readonly defaultData: FlorPalidaData = {
    kicker: ['Nuestra', 'historia', 'continúa'],
    names1: 'Alexéi',
    names2: 'María',
    weddingDate: '2027-09-08',
    saveTheDateLabel: 'Save the date',
    flowerImage: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Banco_Fotos/flor_palida.png',
    greetingTitle: '¡Queridos familiares y amigos!',
    greetingLines: [
      'En nuestra vida está por suceder',
      'algo muy importante.',
      'Seremos muy felices de compartir con ustedes',
      'este día tan especial: ¡el día de nuestra boda!',
      'Los invitamos a la celebración',
      'que será el comienzo de nuestra familia.'
    ],
    waitingTitle: '¡Los esperamos!',
    time: '16:00',
    quote: 'La felicidad está en las personas cercanas',
    venueTitle: 'Lugar de la celebración',
    venueLines: [
      'Complejo campestre «Hacienda del Bosque»',
      'Región de Moscú, distrito de Odintsovo,',
      'Solnechnaya, calle Beriózovaya 12'
    ],
    mapButtonText: 'Abrir mapa',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=Solnechnaya+Beriozovaya+12+Odintsovo',
    dressTitle: 'Dress code',
    dressText: 'Les agradeceremos mucho si acompañan el estilo de nuestra celebración: looks elegantes en tonos suaves y naturales.',
    dressColors: ['#e4dad4', '#d6c3be', '#b8a39b', '#9b9e8d', '#8a7d74'],
    closingTitle: 'Con amor,',
    closingTagline: 'Siempre juntos'
  };

  get data(): FlorPalidaData {
    return { ...this.defaultData, ...(this.invitationData ?? {}) };
  }

  // Día, mes y año corto, cada uno en su línea
  get dateParts(): string[] {
    const [y, m, d] = this.data.weddingDate.split('-');
    return [d, m, y.slice(-2)];
  }

  // "Save the date" en dos líneas: primera palabra y el resto
  get saveTheDate(): [string, string] {
    const [first, ...rest] = this.data.saveTheDateLabel.split(' ');
    return [first, rest.join(' ')];
  }

  // "8 de septiembre de 2027"
  get longDate(): string {
    const [y, m, d] = this.data.weddingDate.split('-').map(Number);
    const month = new Date(y, m - 1, d).toLocaleDateString('es', { month: 'long' });
    return `${d} de ${month} de ${y}`;
  }

  public readonly weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

  get monthName(): string {
    const [y, m] = this.data.weddingDate.split('-').map(Number);
    const name = new Date(y, m - 1, 1).toLocaleDateString('es', { month: 'long' });
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  // Celdas del mes empezando en lunes; null = hueco antes del día 1
  get calendarDays(): (number | null)[] {
    const [y, m] = this.data.weddingDate.split('-').map(Number);
    const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7;
    const total = new Date(y, m, 0).getDate();
    return [
      ...Array(offset).fill(null),
      ...Array.from({ length: total }, (_, i) => i + 1),
    ];
  }

  get weddingDay(): number {
    return Number(this.data.weddingDate.split('-')[2]);
  }

  get monogram(): string {
    return this.data.names1.charAt(0) + this.data.names2.charAt(0);
  }
}
