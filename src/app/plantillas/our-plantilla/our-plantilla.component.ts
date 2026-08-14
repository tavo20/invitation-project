import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountDownComponent } from '../../shared/components/count-down/count-down.component';

interface OurPlantillaInvitationData {
  heroImage: string;
  heroNames1: string;
  heroNames2: string;
  curveText: string;
  dayOfWeek: string;
  dayNumber: string;
  year: string;
  month: string;
  audioSrc: string;
  guestMessage: string;
  guestName: string;
  quote: string;
  quoteReference: string;
  weddingDate: string;
  eventTitle: string;
  eventVenue: string;
  eventAddress: string;
  eventHour: string;
  eventMapLink: string;
  dressWomenNote: string;
  dressMenNote: string;
  dressWomenImage: string;
  dressWomenShoesImage: string;
  dressMenImage: string;
  dressMenShoesImage: string;
  confirmMessage: string;
  confirmLink: string;
  sobresText: string;
  closingImage: string;
}

@Component({
  selector: 'app-our-plantilla',
  standalone: true,
  imports: [CountDownComponent, CommonModule],
  templateUrl: './our-plantilla.component.html',
  styleUrl: './our-plantilla.component.scss'
})
export class OurPlantillaComponent {
  @Input() invitationData: Partial<OurPlantillaInvitationData> | null = null;

  private readonly defaultData: OurPlantillaInvitationData = {
    heroImage: 'assets/images/main-photo.png',
    heroNames1: 'Gustavo',
    heroNames2: 'Gissel',
    curveText: 'GUSTAVO&GISSEL',
    dayOfWeek: 'SÁBADO',
    dayNumber: '9',
    year: '2025',
    month: 'A G O',
    audioSrc: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Songs/Fonseca%20-%20Que%20Suerte%20Tenerte%20(Audio).mp3',
    guestMessage: 'Bienvenid@s a nuestra Boda.',
    guestName: '',
    quote: 'El amor es paciente, es bondadoso. No se enoja fácilmente, todo lo soporta.',
    quoteReference: '1 Corintios 13:4-5',
    weddingDate: 'August 9, 2027 10:00:00',
    eventTitle: 'Ceremonia y Recepción',
    eventVenue: 'ATRIO HOTEL',
    eventAddress: 'Timaná, Huila',
    eventHour: '3:00 PM',
    eventMapLink: 'https://maps.app.goo.gl/UP6C67Tya92kXPRX7?g_st=iwb',
    dressWomenNote: 'Ellas Divinas (Se reserva el color verde oliva)',
    dressMenNote: 'Ellos Guapos',
    dressWomenImage: 'assets/images/w-dress.png',
    dressWomenShoesImage: 'assets/images/w-shoes.png',
    dressMenImage: 'assets/images/m-shoes.png',
    dressMenShoesImage: 'assets/images/m-shoes.png',
    confirmMessage: 'Hemos pensado en ti porque has sido importante en nuestras vidas, queremos contar contigo.',
    confirmLink: 'https://forms.gle/rZkQ7R6z6bAi4o3fA',
    sobresText: 'lluvia de sobres.',
    closingImage: 'assets/images/main-photo.png'
  };

  get data(): OurPlantillaInvitationData {
    return { ...this.defaultData, ...(this.invitationData ?? {}) };
  }

  get weddingDate(): string {
    return this.data.weddingDate;
  }

  get curveLetters(): string[] {
    return this.data.curveText.replace(/\s/g, '').split('');
  }

  getCurveAngle(index: number, total: number): string {
    const start = -80;
    const end = 70;
    const step = total > 1 ? (end - start) / (total - 1) : 0;
    return `${start + step * index}deg`;
  }

  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
  isPlaying: boolean = false;


  togglePlayPause(): void {
    if (this.isPlaying) {
      this.audioPlayerRef.nativeElement.pause();
    } else {
      this.audioPlayerRef.nativeElement.play();
    }
    this.isPlaying = !this.isPlaying;
  }
}

