import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlorSobreComponent } from './flor-sobre/flor-sobre.component';

type PaletteName = 'burgundy' | 'navy' | 'forest' | 'slate';

interface FlowerPalette {
  deep: string;
  dark: string;
  mid: string;
  bright: string;
  light: string;
  soft: string;
  vein: string;
  veinSoft: string;
  stamen: string;
  centerLight: string;
  centerMid: string;
  centerDark: string;
  shadow: string;
}

interface InvitationPalette {
  color: string;
  sombra: string;
  luz: string;
  sombraProfunda: string;
  paper: string;
  text: string;
  flower: FlowerPalette;
}

interface SobreAmanecerData {
  names1: string;
  names2: string;
  date: string;
  palette: PaletteName;
  inicial1?: string;
  inicial2?: string;
  announceTitle?: string;
  announceMessage?: string;
  heroImage?: string;
  musicLabel?: string;
  audioSrc?: string;
  storyText?: string;
  month?: string;
  dayOfWeek?: string;
  dayNumber?: string;
  year?: string;
  weddingDate?: string;
  eventsImage?: string;
  ceremonyTime?: string;
  ceremonyTitle?: string;
  ceremonyPlace?: string;
  ceremonyArea?: string;
  ceremonyMapLink?: string;
  receptionTime?: string;
  receptionTitle?: string;
  receptionPlace?: string;
  receptionArea?: string;
  receptionMapLink?: string;
  eventButtonLabel?: string;
  itineraryTitle?: string;
  itinerary?: ItineraryItem[];
  confirmTitle?: string;
  confirmText?: string;
  confirmButtonText?: string;
  confirmLink?: string;
  dressTitle?: string;
  dressType?: string;
  dressNote?: string;
  dressImage?: string;
  giftTitle?: string;
  closingImage?: string;
  noKidsTitle?: string;
  noKidsText?: string;
  presenceText?: string;
  thanksText?: string;
}

interface ItineraryItem {
  time: string;
  label: string;
  icon: 'rings' | 'cheers' | 'arch' | 'dance' | 'dinner' | 'party' | 'clock';
}

@Component({
  selector: 'app-sobre-amanecer',
  standalone: true,
  imports: [CommonModule, FlorSobreComponent],
  templateUrl: './sobre-amanecer.component.html',
  styleUrl: './sobre-amanecer.component.scss'
})
export class SobreAmanecerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() invitationData: Partial<SobreAmanecerData> | null = null;
  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;

  selectedPalette: PaletteName = 'burgundy';
  isPlaying = false;
  progress = 0;
  days = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;
  private countdownInterval?: ReturnType<typeof setInterval>;

  readonly palettes: Record<PaletteName, InvitationPalette> = {
    burgundy: {
      color: '#633642',
      sombra: '#44222b',
      luz: '#733f4d',
      sombraProfunda: '#562c37',
      paper: '#f6f1ea',
      text: '#ffffff',
      flower: {
        deep: '#3b0f19',
        dark: '#6e192c',
        mid: '#ad2844',
        bright: '#d94867',
        light: '#f27d97',
        soft: '#ffa3b8',
        vein: '#ff8da3',
        veinSoft: '#ffccd7',
        stamen: '#fff3b0',
        centerLight: '#ffd54f',
        centerMid: '#ff9800',
        centerDark: '#e65100',
        shadow: '#1e050b'
      }
    },
    navy: {
      color: '#24344d',
      sombra: '#141e30',
      luz: '#314463',
      sombraProfunda: '#182436',
      paper: '#f4f2ee',
      text: '#ffffff',
      flower: {
        deep: '#0b1424',
        dark: '#152744',
        mid: '#2a4d7a',
        bright: '#4a74a8',
        light: '#7ea4d4',
        soft: '#b7d0ec',
        vein: '#9fc0e8',
        veinSoft: '#d5e6f7',
        stamen: '#e8f0ff',
        centerLight: '#f0d9a0',
        centerMid: '#d4a24c',
        centerDark: '#8c5e1f',
        shadow: '#060b14'
      }
    },
    forest: {
      color: '#2f4d3b',
      sombra: '#1c3024',
      luz: '#3e634d',
      sombraProfunda: '#233a2c',
      paper: '#f4f3ec',
      text: '#ffffff',
      flower: {
        deep: '#102018',
        dark: '#1c3a28',
        mid: '#2f6a48',
        bright: '#4d8f66',
        light: '#7db892',
        soft: '#b5d9c2',
        vein: '#8fc9a4',
        veinSoft: '#d2ecdb',
        stamen: '#f1f5d8',
        centerLight: '#f0e2a8',
        centerMid: '#c9a63d',
        centerDark: '#7a5f16',
        shadow: '#08140e'
      }
    },
    slate: {
      color: '#434850',
      sombra: '#2b2f34',
      luz: '#575d66',
      sombraProfunda: '#363a40',
      paper: '#f3f2ef',
      text: '#ffffff',
      flower: {
        deep: '#1a1c1f',
        dark: '#2f3338',
        mid: '#4f565f',
        bright: '#727a85',
        light: '#9aa2ad',
        soft: '#c7ccd3',
        vein: '#b0b7c0',
        veinSoft: '#e0e3e8',
        stamen: '#f2f0e8',
        centerLight: '#e8d9b0',
        centerMid: '#c4a66a',
        centerDark: '#7d6434',
        shadow: '#0d0e10'
      }
    }
  };

  readonly paletteOptions: { key: PaletteName; label: string }[] = [
    { key: 'burgundy', label: 'Borgoña' },
    { key: 'navy', label: 'Navy' },
    { key: 'forest', label: 'Bosque' },
    { key: 'slate', label: 'Gris' }
  ];

  private readonly defaultData: SobreAmanecerData = {
    names1: 'Marcos',
    names2: 'Mariana',
    date: '06.12.2025',
    palette: 'burgundy',
    inicial1: 'M',
    inicial2: 'M',
    announceTitle: '¡NOS CASAMOS!',
    announceMessage: 'No lo creían, pero nuestro día llegó.',
    heroImage: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/portada_2_neblina.jpeg',
    musicLabel: 'Dale play a nuestra canción',
    audioSrc: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Songs/Fonseca%20-%20Prometo%20(LyricLetra).mp3',
    storyText: 'Nuestra historia continúa... por ello, con el amor que nos une, la bendición de Dios y el apoyo de nuestros padres, uniremos nuestras vidas y queremos que seas parte de este nuevo capítulo.',
    month: 'ENERO',
    dayOfWeek: 'SÁBADO',
    dayNumber: '24',
    year: '2027',
    weddingDate: 'January 24, 2027 16:00:00',
    eventsImage: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/basic_02.jpg',
    ceremonyTime: '4:30 pm',
    ceremonyTitle: 'CEREMONIA CIVIL',
    ceremonyPlace: 'IGLESIA MACARENA',
    ceremonyArea: 'Miraflores',
    ceremonyMapLink: '#',
    receptionTime: '6:30 pm',
    receptionTitle: 'RECEPCIÓN',
    receptionPlace: 'CONDOMINIO URUBÓ',
    receptionArea: 'Miraflores',
    receptionMapLink: '#',
    eventButtonLabel: 'Ver ubicación',
    itineraryTitle: 'ITINERARIO DE ACTIVIDADES',
    itinerary: [
      { time: '6:30', label: 'CEREMONIA CIVIL', icon: 'rings' },
      { time: '6:50', label: 'CÓCTEL DE BIENVENIDA', icon: 'cheers' },
      { time: '7:30', label: 'INGRESO DE LOS ESPOSOS', icon: 'arch' },
      { time: '7:35', label: 'PRIMER BAILE Y BRINDIS', icon: 'dance' },
      { time: '8:30', label: 'CENA', icon: 'dinner' },
      { time: '10:00', label: 'FIESTA', icon: 'party' },
      { time: '3:00 a.m.', label: 'FIN', icon: 'clock' }
    ],
    confirmTitle: 'CONFIRMAR ASISTENCIA',
    confirmText: 'Agradecemos que confirmes tu asistencia antes del 27 de diciembre',
    confirmButtonText: 'Confirmar aquí',
    confirmLink: '#',
    dressTitle: 'CÓDIGO DE VESTIMENTA',
    dressType: 'Formal',
    dressNote: 'Con mucho cariño, les pedimos evitar prendas en color blanco y tonos similares.',
    dressImage: 'assets/sobre-amanecer/dress-code.svg',
    giftTitle: 'LLUVIA DE SOBRES',
    closingImage: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/portada_neblina.jpeg',
    noKidsTitle: 'SIN NIÑOS',
    noKidsText: 'Un evento para adultos está en camino. ¡Así que prepárense para una noche llena de diversión! Dejemos a los niños en casa esta vez.',
    presenceText: 'ESPERAMOS CONTAR CON SU PRESENCIA',
    thanksText: 'Muchas Gracias!'
  };

  get data(): SobreAmanecerData {
    const merged = { ...this.defaultData, ...(this.invitationData ?? {}) };
    return {
      ...merged,
      inicial1: merged.inicial1 || merged.names1?.charAt(0)?.toUpperCase() || 'A',
      inicial2: merged.inicial2 || merged.names2?.charAt(0)?.toUpperCase() || 'V',
      itinerary: merged.itinerary?.length ? merged.itinerary : this.defaultData.itinerary
    };
  }

  get colors(): InvitationPalette {
    return this.palettes[this.selectedPalette] ?? this.palettes.burgundy;
  }

  get paletteVars(): Record<string, string> {
    const colors = this.colors;
    const flower = colors.flower;
    return {
      '--sobre-color': colors.color,
      '--sobre-sombra': colors.sombra,
      '--sobre-luz': colors.luz,
      '--sobre-sombra-profunda': colors.sombraProfunda,
      '--paper': colors.paper,
      '--texto-color': colors.text,
      '--story-bg': colors.luz,
      '--flor-deep': flower.deep,
      '--flor-dark': flower.dark,
      '--flor-mid': flower.mid,
      '--flor-bright': flower.bright,
      '--flor-light': flower.light,
      '--flor-soft': flower.soft,
      '--flor-vein': flower.vein,
      '--flor-vein-soft': flower.veinSoft,
      '--flor-stamen': flower.stamen,
      '--flor-center-light': flower.centerLight,
      '--flor-center-mid': flower.centerMid,
      '--flor-center-dark': flower.centerDark,
      '--flor-shadow': flower.shadow
    };
  }

  ngOnInit(): void {
    this.applyIncomingPalette();
    this.startCountdown();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invitationData']) {
      this.applyIncomingPalette();
      this.startCountdown();
    }
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  setPalette(palette: PaletteName): void {
    this.selectedPalette = palette;
  }

  togglePlayPause(): void {
    const audio = this.audioPlayerRef?.nativeElement;
    if (!audio || !this.data.audioSrc) return;

    if (this.isPlaying) {
      audio.pause();
    } else {
      void audio.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  onTimeUpdate(): void {
    const audio = this.audioPlayerRef?.nativeElement;
    if (!audio || !audio.duration) {
      this.progress = 0;
      return;
    }
    this.progress = (audio.currentTime / audio.duration) * 100;
  }

  onAudioEnded(): void {
    this.isPlaying = false;
    this.progress = 0;
  }

  seekAudio(event: MouseEvent): void {
    const audio = this.audioPlayerRef?.nativeElement;
    const track = event.currentTarget as HTMLElement;
    if (!audio || !audio.duration) return;

    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    this.progress = ratio * 100;
  }

  formatCount(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  private applyIncomingPalette(): void {
    const incoming = this.data.palette;
    if (incoming && this.palettes[incoming]) {
      this.selectedPalette = incoming;
    }
  }

  private startCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    const target = new Date(this.data.weddingDate || '').getTime();
    if (Number.isNaN(target)) return;

    const tick = () => {
      const distance = target - Date.now();
      if (distance <= 0) {
        this.days = 0;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        return;
      }
      this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
    };

    tick();
    this.countdownInterval = setInterval(tick, 1000);
  }
}
