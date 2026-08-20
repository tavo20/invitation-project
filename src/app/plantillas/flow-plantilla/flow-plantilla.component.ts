import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountDownComponent } from '../../shared/components/count-down/count-down.component';

export interface FlowItineraryItem {
  time: string;
  label: string;
}

export interface FlowPlantillaData {
  names1?: string;
  names2?: string;
  invitationText1?: string;
  invitationText2?: string;
  dayOfWeek?: string;
  month?: string;
  dayNumber?: string;
  year?: string;
  hourLabel?: string;
  weddingDate?: string;
  musicImage?: string;
  songTitle?: string;
  songArtist?: string;
  audioSrc?: string;
  parentsTitle?: string;
  brideLabel?: string;
  brideParents?: string[];
  groomLabel?: string;
  groomParents?: string[];
  padrinosLabel?: string;
  padrinos?: string[];
  countdownTitle?: string;
  countdownText?: string;
  image2?: string;
  eventTitle?: string;
  eventVenue?: string;
  eventAddress?: string;
  eventHour?: string;
  eventMapLink?: string;
  eventButtonText?: string;
  dressTitle?: string;
  dressType?: string;
  dressColors?: string[];
  dressNote?: string;
  quoteImage?: string;
  quote?: string;
  itineraryTitle?: string;
  itinerary?: FlowItineraryItem[];
  confirmTitle?: string;
  confirmText?: string;
  confirmButtonText?: string;
  confirmLink?: string;
  sobresTitle?: string;
  closingHighlight?: string;
  closingNames?: string;
}

@Component({
  selector: 'app-flow-plantilla',
  standalone: true,
  imports: [CommonModule, CountDownComponent],
  templateUrl: './flow-plantilla.component.html',
  styleUrl: './flow-plantilla.component.scss'
})
export class FlowPlantillaComponent {
  @Input() invitationData: Partial<FlowPlantillaData> | null = null;
  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;

  isPlaying = false;
  isRepeat = false;
  isShuffle = false;
  progress = 0;
  currentTime = 0;
  duration = 0;

  private readonly defaultData: Required<FlowPlantillaData> = {
    names1: 'Mariana',
    names2: 'Javier',
    invitationText1: 'ES UN HONOR INVITARTE A LA CELEBRACIÓN',
    invitationText2: 'DE NUESTRA BODA',
    dayOfWeek: 'SÁBADO',
    month: 'NOV',
    dayNumber: '26',
    year: '2030',
    hourLabel: '20:00 HRS.',
    weddingDate: 'November 26, 2030 20:00:00',
    musicImage: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Banco_Fotos/flow_02.jpg',
    songTitle: 'Perfect',
    songArtist: 'Ed Sheeran',
    audioSrc: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Songs/Ed%20Sheeran%20-%20Perfect.mp3',
    parentsTitle: 'Con la bendición de nuestros padres',
    brideLabel: 'Novia',
    brideParents: ['Laura Mendoza', 'Carlos Mendoza'],
    groomLabel: 'Novio',
    groomParents: ['Marta Ríos', 'Jorge Ríos'],
    padrinosLabel: 'Padrinos',
    padrinos: ['Ana Salazar', 'Pedro Castillo'],
    countdownTitle: 'Faltan pocos días',
    countdownText: 'Acompáñanos a contar los días para celebrar este momento tan especial.',
    image2: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Banco_Fotos/flow_01.jpg',
    eventTitle: 'Ceremonia y Recepción',
    eventVenue: 'Hacienda Los Faroles',
    eventAddress: 'Chía, Cundinamarca',
    eventHour: '3:00 PM',
    eventMapLink: '#',
    eventButtonText: 'Ver ubicación',
    dressTitle: 'Dress Code',
    dressType: 'Semi Formal',
    dressColors: ['#2c4a2e', '#8e9d70', '#d4c4a8', '#f3efe8'],
    dressNote: 'Por favor, evita vestir de color verde claro, está reservado para la novia.',
    quoteImage: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Banco_Fotos/flow_01.jpg',
    quote: 'Bajo un mismo cielo escribimos nuestra historia, y esta noche queremos compartir contigo el comienzo del capítulo más hermoso.',
    itineraryTitle: 'Itinerario',
    itinerary: [
      { time: '4:00 PM', label: 'Ceremonia' },
      { time: '5:30 PM', label: 'Cóctel de bienvenida' },
      { time: '7:00 PM', label: 'Recepción' },
      { time: '9:00 PM', label: 'Fiesta' }
    ],
    confirmTitle: 'Confirma tu asistencia',
    confirmText: 'Tu respuesta nos ayudará a organizar este día con mucho cariño.',
    confirmButtonText: 'Confirmar aquí',
    confirmLink: '#',
    sobresTitle: 'Lluvia de sobres',
    closingHighlight: 'Tenemos la luna, la música y cada detalle preparado… <br> Solo falta lo más importante: tú.',
    closingNames: 'Mariana & Javier'
  };

  get data(): Required<FlowPlantillaData> {
    const incoming = this.invitationData ?? {};
    const merged = { ...this.defaultData, ...incoming };
    return {
      ...merged,
      brideParents: incoming.brideParents?.length ? incoming.brideParents : this.defaultData.brideParents,
      groomParents: incoming.groomParents?.length ? incoming.groomParents : this.defaultData.groomParents,
      padrinos: incoming.padrinos?.length ? incoming.padrinos : this.defaultData.padrinos,
      dressColors: incoming.dressColors?.length ? incoming.dressColors : this.defaultData.dressColors,
      itinerary: incoming.itinerary?.length ? incoming.itinerary : this.defaultData.itinerary,
      closingNames: incoming.closingNames || `${merged.names1} & ${merged.names2}`
    };
  }

  get weddingDate(): string {
    return this.data.weddingDate;
  }

  get songTitle(): string {
    return this.data.songTitle;
  }

  get songArtist(): string {
    return this.data.songArtist;
  }

  get audioSrc(): string {
    return this.data.audioSrc;
  }

  togglePlayPause(): void {
    const audio = this.audioPlayerRef?.nativeElement;
    if (!audio) return;

    if (this.isPlaying) {
      audio.pause();
    } else {
      void audio.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  toggleRepeat(): void {
    this.isRepeat = !this.isRepeat;
    const audio = this.audioPlayerRef?.nativeElement;
    if (audio) {
      audio.loop = this.isRepeat;
    }
  }

  skip(seconds: number): void {
    const audio = this.audioPlayerRef?.nativeElement;
    if (!audio || !audio.duration) return;
    audio.currentTime = Math.min(audio.duration, Math.max(0, audio.currentTime + seconds));
    this.onTimeUpdate();
  }

  onTimeUpdate(): void {
    const audio = this.audioPlayerRef?.nativeElement;
    if (!audio?.duration) {
      this.progress = 0;
      return;
    }
    this.currentTime = audio.currentTime;
    this.duration = audio.duration;
    this.progress = (audio.currentTime / audio.duration) * 100;
  }

  onLoadedMetadata(): void {
    const audio = this.audioPlayerRef?.nativeElement;
    this.duration = audio?.duration || 0;
  }

  onAudioEnded(): void {
    if (this.isRepeat) return;
    this.isPlaying = false;
    this.progress = 0;
    this.currentTime = 0;
  }

  seekAudio(event: MouseEvent): void {
    const audio = this.audioPlayerRef?.nativeElement;
    const track = event.currentTarget as HTMLElement;
    if (!audio || !audio.duration) return;

    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    this.progress = ratio * 100;
    this.currentTime = audio.currentTime;
  }

  formatTime(seconds: number): string {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const rest = Math.floor(seconds % 60);
    return `${minutes}:${rest.toString().padStart(2, '0')}`;
  }
}
