import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

export type NeblinaPaletteName = 'mist' | 'dusk' | 'rose' | 'forest';

export interface NeblinaItineraryItem {
  time: string;
  label: string;
}

interface NeblinaPalette {
  pageBg: string;
  text: string;
  textSoft: string;
  textMuted: string;
  title: string;
  accent: string;
  line: string;
  cardBg: string;
  cardBorder: string;
  icon: string;
  buttonBg: string;
  buttonText: string;
  storyBgTop: string;
  storyBg: string;
  storyText: string;
  dressColors: string[];
}

export interface NeblinaInvitationData {
  heroImage: string;
  monogram: string;
  names1: string;
  names2: string;
  inicial_1: string;
  inicial_2: string;
  date: string;
  saveDateText: string;
  location: string;
  quote: string;
  countdownDate: string;
  confirmLink: string;
  parentsTitle: string;
  brideLabel: string;
  brideParent1: string;
  brideParent2: string;
  groomLabel: string;
  groomParent1: string;
  groomParent2: string;
  padrinosLabel: string;
  padrino1: string;
  padrino2: string;
  storyTitle: string;
  storyText1: string;
  storyText2: string;
  storyImages: string[];
  itineraryTitle: string;
  itinerary: NeblinaItineraryItem[];
  ceremonyTitle: string;
  ceremonyTime: string;
  ceremonyPlace: string;
  ceremonyAddress: string;
  ceremonyMapLink: string;
  ceremonyButton: string;
  dressTitle: string;
  dressType: string;
  dressColors: string[];
  dressNote: string;
  palette: NeblinaPaletteName;
  finalMessage: string;
  giftTitle: string;
  audioSrc: string;
  audioName: string;
  showMusic: boolean;
  showQuote: boolean;
  showSaveDate: boolean;
  showParents: boolean;
  showCeremony: boolean;
  showStory: boolean;
  showTimeline: boolean;
  showDressCode: boolean;
  showFinal: boolean;
  showGift: boolean;
  isProduction: boolean;
}

/** Ejemplo que se ve cuando la invitación no trae un campo (también lo usa el editor del cliente). */
export const NEBLINA_DEFAULT_DATA: NeblinaInvitationData = {
  heroImage: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Cliente_Marca/Artur/Examples/neblina_01.jpg',
  monogram: 'GA',
  names1: 'Guillermo',
  names2: 'Alicia',
  date: '12 · 06 · 2027',
  saveDateText: '12 DE JUN DEL 2027',
  location: 'La Calera, Cundinamarca',
  inicial_1: 'G',
  inicial_2: 'A',
  quote: 'Hay amores que se sienten como casa: silenciosos, seguros y eternos.',
  countdownDate: 'June 12, 2027 16:30:00',
  confirmLink: '#',
  parentsTitle: 'Con la bendición de nuestros padres',
  brideLabel: 'Novia',
  brideParent1: 'Elena Vargas de Herrera',
  brideParent2: 'Ricardo Herrera Mejía',
  groomLabel: 'Novio',
  groomParent1: 'Carmen Alicia Gómez',
  groomParent2: 'Fernando Ruiz Palacio',
  padrinosLabel: 'Padrinos',
  padrino1: 'Isabel Duarte',
  padrino2: 'Tomás Rincón',
  storyTitle: 'Nuestra historia',
  storyText1: 'Guillermo y Alicia se conocieron en una cena de amigos y, sin prisa, empezaron a elegirse todos los días. Entre caminatas, café y conversaciones que se alargaban hasta tarde, entendieron que el otro era su lugar seguro.',
  storyText2: 'Un atardecer en el jardín, entre árboles y silencio, él le pidió que escribieran juntos el resto de la historia. Hoy abren las puertas de su boda para celebrar ese sí con quienes más quieren.',
  storyImages: [
    'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Cliente_Marca/Artur/Examples/neblina_01.jpg',
    'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Cliente_Marca/Artur/Examples/neblina_02.jpg',
    'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Cliente_Marca/Artur/Examples/neblina_03.jpg',
    'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Cliente_Marca/Artur/Examples/neblina_04.jpg'
  ],
  itineraryTitle: 'ITINERARIO',
  itinerary: [
    { label: 'Llegada de invitados', time: '4:00 PM' },
    { label: 'Ceremonia', time: '4:30 PM' },
    { label: 'Cóctel de bienvenida', time: '5:30 PM' },
    { label: 'Cena y brindis', time: '7:00 PM' },
    { label: 'Fiesta', time: '9:00 PM' }
  ],
  ceremonyTitle: 'Ceremonia',
  ceremonyTime: '4:30 PM',
  ceremonyPlace: 'Capilla San José',
  ceremonyAddress: 'Hacienda El Encanto, La Calera',
  ceremonyMapLink: 'https://maps.google.com/?q=La+Calera+Cundinamarca',
  ceremonyButton: 'VER MAPA',
  dressTitle: 'Dress Code',
  dressType: 'Formal de jardín',
  dressColors: ['#6a6e78', '#8b7d86', '#c4b8ad', '#efeae4'],
  dressNote: 'El blanco queda reservado para Alicia. Evita tenis y colores neón.',
  palette: 'mist',
  finalMessage: 'Gracias por acompañarnos a decir que sí. Los esperamos con el corazón abierto para celebrar este día juntos.',
  giftTitle: 'Lluvia de sobres',
  audioSrc: 'assets/songs/thinking_out.mp3',
  audioName: 'Thinking Out Loud',
  showMusic: true,
  showQuote: true,
  showSaveDate: true,
  showParents: true,
  showCeremony: true,
  showStory: true,
  showTimeline: true,
  showDressCode: true,
  showFinal: true,
  showGift: true,
  isProduction: false,
};

@Component({
  selector: 'app-neblina',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './neblina.component.html',
  styleUrl: './neblina.component.scss'
})
export class NeblinaComponent implements OnInit, OnChanges, OnDestroy {
  @Input() invitationData: Partial<NeblinaInvitationData> | null = null;
  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
  // Cada sección se anima al entrar en pantalla; con setter se observan también
  // las que aparecen después (al prender su toggle en el editor).
  @ViewChild('quoteSection') set quoteSection(ref: ElementRef<HTMLElement> | undefined) { this.reveal(ref); }
  @ViewChild('saveDateSection') set saveDateSection(ref: ElementRef<HTMLElement> | undefined) { this.reveal(ref); }
  @ViewChild('parentsSection') set parentsSection(ref: ElementRef<HTMLElement> | undefined) { this.reveal(ref); }
  @ViewChild('storySection') set storySection(ref: ElementRef<HTMLElement> | undefined) { this.reveal(ref); }
  @ViewChild('timelineSection') set timelineSection(ref: ElementRef<HTMLElement> | undefined) { this.reveal(ref); }
  @ViewChild('ceremonySection') set ceremonySection(ref: ElementRef<HTMLElement> | undefined) { this.reveal(ref); }
  @ViewChild('dressSection') set dressSection(ref: ElementRef<HTMLElement> | undefined) { this.reveal(ref); }
  @ViewChild('finalSection') set finalSection(ref: ElementRef<HTMLElement> | undefined) { this.reveal(ref); }

  isPlaying = false;
  days = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;
  currentStorySlide = 0;
  selectedPalette: NeblinaPaletteName = 'mist';
  isProduction = false;
  private countdownInterval?: ReturnType<typeof setInterval>;
  private carouselInterval?: ReturnType<typeof setInterval>;
  private readonly observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          this.observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 }
  );

  readonly palettes: Record<NeblinaPaletteName, NeblinaPalette> = {
    mist: {
      pageBg: '#e3e3e3',
      text: '#6f6f6f',
      textSoft: '#7a7a7a',
      textMuted: '#8b8b8b',
      title: '#686868',
      accent: '#7a7a7a',
      line: 'rgba(110, 110, 110, 0.42)',
      cardBg: 'rgba(250, 248, 243, 0.95)',
      cardBorder: 'rgba(170, 170, 170, 0.42)',
      icon: '#9b9b9b',
      buttonBg: '#8a8a8a',
      buttonText: '#ffffff',
      storyBgTop: '#929292',
      storyBg: '#808080',
      storyText: '#f2f2f2',
      dressColors: ['#6a6e78', '#8b7d86', '#c4b8ad', '#efeae4']
    },
    dusk: {
      pageBg: '#d8dde4',
      text: '#5a6573',
      textSoft: '#6a7584',
      textMuted: '#8893a0',
      title: '#4f5c6b',
      accent: '#5d6b7c',
      line: 'rgba(93, 107, 124, 0.42)',
      cardBg: 'rgba(245, 247, 250, 0.96)',
      cardBorder: 'rgba(140, 155, 175, 0.4)',
      icon: '#7d8b9c',
      buttonBg: '#5d6b7c',
      buttonText: '#ffffff',
      storyBgTop: '#6b7a8c',
      storyBg: '#5d6b7c',
      storyText: '#f4f6f8',
      dressColors: ['#3d4a5c', '#6a7b8f', '#b7c0cb', '#eef1f4']
    },
    rose: {
      pageBg: '#e8e0e2',
      text: '#6d5c63',
      textSoft: '#7d6a71',
      textMuted: '#9a888e',
      title: '#6a545c',
      accent: '#8b6d76',
      line: 'rgba(139, 109, 118, 0.42)',
      cardBg: 'rgba(250, 246, 247, 0.96)',
      cardBorder: 'rgba(180, 155, 162, 0.4)',
      icon: '#a58991',
      buttonBg: '#8b6d76',
      buttonText: '#ffffff',
      storyBgTop: '#9a7b84',
      storyBg: '#8b6d76',
      storyText: '#f8f3f4',
      dressColors: ['#5c424a', '#8b6d76', '#c9b4b8', '#f4ecee']
    },
    forest: {
      pageBg: '#e2e4de',
      text: '#5a6358',
      textSoft: '#6a7368',
      textMuted: '#8a9284',
      title: '#4f5a4c',
      accent: '#5f6d5c',
      line: 'rgba(95, 109, 92, 0.42)',
      cardBg: 'rgba(247, 248, 244, 0.96)',
      cardBorder: 'rgba(150, 160, 145, 0.4)',
      icon: '#7d8a78',
      buttonBg: '#5f6d5c',
      buttonText: '#ffffff',
      storyBgTop: '#6d7a68',
      storyBg: '#5f6d5c',
      storyText: '#f3f5f0',
      dressColors: ['#3d4a3a', '#6d7a68', '#b5bdb0', '#eef0ea']
    }
  };

  readonly paletteOptions: { key: NeblinaPaletteName; label: string }[] = [
    { key: 'mist', label: 'Niebla' },
    { key: 'dusk', label: 'Atardecer' },
    { key: 'rose', label: 'Rosa' },
    { key: 'forest', label: 'Bosque' }
  ];

  private readonly defaultData = NEBLINA_DEFAULT_DATA;

  get data(): NeblinaInvitationData {
    const incoming = this.invitationData ?? {};
    const merged = { ...this.defaultData, ...incoming };
    return {
      ...merged,
      storyImages: incoming.storyImages?.length ? incoming.storyImages : this.defaultData.storyImages,
      itinerary: incoming.itinerary?.length ? incoming.itinerary : this.defaultData.itinerary,
      dressColors: incoming.dressColors?.length ? incoming.dressColors : this.colors.dressColors
    };
  }

  get colors(): NeblinaPalette {
    return this.palettes[this.selectedPalette] ?? this.palettes.mist;
  }

  get paletteVars(): Record<string, string> {
    const colors = this.colors;
    return {
      '--neblina-page-bg': colors.pageBg,
      '--neblina-text': colors.text,
      '--neblina-text-soft': colors.textSoft,
      '--neblina-text-muted': colors.textMuted,
      '--neblina-title': colors.title,
      '--neblina-accent': colors.accent,
      '--neblina-line': colors.line,
      '--neblina-card-bg': colors.cardBg,
      '--neblina-card-border': colors.cardBorder,
      '--neblina-icon': colors.icon,
      '--neblina-button-bg': colors.buttonBg,
      '--neblina-button-text': colors.buttonText,
      '--neblina-story-bg-top': colors.storyBgTop,
      '--neblina-story-bg': colors.storyBg,
      '--neblina-story-text': colors.storyText
    };
  }

  formatNumber(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  ngOnInit(): void {
    this.applyIncomingPalette();
    this.startCountdown();
    this.startStoryCarousel();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invitationData']) {
      this.applyIncomingPalette();
    }
  }

  setPalette(palette: NeblinaPaletteName): void {
    this.selectedPalette = palette;
  }

  setStorySlide(index: number): void {
    this.currentStorySlide = index;
  }

  togglePlayPause(): void {
    const audio = this.audioPlayerRef?.nativeElement;
    if (!audio) {
      return;
    }
    // isPlaying se actualiza con los eventos play/pause del <audio> (también si cambia la canción)
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    this.observer.disconnect();
  }

  private reveal(ref: ElementRef<HTMLElement> | undefined): void {
    if (ref) {
      this.observer.observe(ref.nativeElement);
    }
  }

  private startCountdown(): void {
    this.updateCountdown();
    this.countdownInterval = setInterval(() => this.updateCountdown(), 1000);
  }

  private startStoryCarousel(): void {
    this.carouselInterval = setInterval(() => {
      const totalSlides = this.data.storyImages.length;
      if (!totalSlides) {
        return;
      }
      this.currentStorySlide = (this.currentStorySlide + 1) % totalSlides;
    }, 4000);
  }

  private updateCountdown(): void {
    const targetTime = new Date(this.data.countdownDate).getTime();
    const now = new Date().getTime();
    const distance = targetTime - now;

    if (distance < 0) {
      this.days = 0;
      this.hours = 0;
      this.minutes = 0;
      this.seconds = 0;
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }
      return;
    }

    this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
    this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
  }

  private applyIncomingPalette(): void {
    const incoming = this.data.palette;
    if (incoming && this.palettes[incoming]) {
      this.selectedPalette = incoming;
    }
    this.isProduction = this.invitationData?.isProduction ?? false;
  }
}
