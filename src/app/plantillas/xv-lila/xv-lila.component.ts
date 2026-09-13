import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface XvLilaData {
  quinceanera?: string;
  fechaTexto?: string;
  eventDate?: string;
  month?: string;
  dayOfWeek?: string;
  dayNumber?: string;
  year?: string;
  heroImage?: string;
  heroImage2?: string;
  audioSrc?: string;
  quote?: string;
  padresTitle?: string;
  padres?: string[];
  padrinosTitle?: string;
  padrinos?: string[];
  ceremonia?: {
    lugar: string;
    hora: string;
    direccion: string;
    mapa: string;
  };
  recepcion?: {
    lugar: string;
    hora: string;
    direccion: string;
    mapa: string;
  };
  itinerario?: { hora: string; titulo: string }[];
  dressCode?: string;
  dressNote?: string;
  numeroCuenta?: string;
  banco?: string;
  titularCuenta?: string;
  whatsapp?: string;
  hashtag?: string;
  closingText?: string;
  showPadrinos?: boolean;
  showItinerario?: boolean;
  showRegalos?: boolean;
  showHashtag?: boolean;
}

@Component({
  selector: 'app-xv-lila',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './xv-lila.component.html',
  styleUrl: './xv-lila.component.scss'
})
export class XvLilaComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() invitationData: Partial<XvLilaData> | null = null;

  private readonly defaultData: XvLilaData = {
    quinceanera: 'Valentina',
    fechaTexto: 'Sábado 15 de Noviembre, 2026',
    eventDate: 'November 15, 2026 18:00:00',
    month: 'NOVIEMBRE',
    dayOfWeek: 'SÁBADO',
    dayNumber: '15',
    year: '2026',
    heroImage: 'assets/15_02/dos.jpeg',
    heroImage2: 'assets/15_02/dos.jpeg',
    audioSrc: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Songs/Ed%20Sheeran%20-%20Perfect.mp3',
    quote: '"Hay momentos inolvidables que se atesoran en el corazón para siempre, por esa razón, quiero que compartas conmigo éste día tan especial."',
    padresTitle: 'Mis Padres',
    padres: ['Sr. Roberto González', 'Sra. Ana María López'],
    padrinosTitle: 'Mis Padrinos',
    padrinos: ['Sr. Carlos Mendoza', 'Sra. Lucía Ramírez'],
    ceremonia: {
      lugar: 'Parroquia San José',
      hora: '6:00 PM',
      direccion: 'Calle Principal #123, Centro',
      mapa: 'https://maps.google.com'
    },
    recepcion: {
      lugar: 'Salón Imperial',
      hora: '8:00 PM',
      direccion: 'Av. Las Flores #456',
      mapa: 'https://maps.google.com'
    },
    itinerario: [
      { hora: '6:00 PM', titulo: 'Ceremonia Religiosa' },
      { hora: '7:30 PM', titulo: 'Recepción' },
      { hora: '8:30 PM', titulo: 'Vals' },
      { hora: '9:30 PM', titulo: 'Cena' },
      { hora: '11:00 PM', titulo: '¡A bailar!' }
    ],
    dressCode: 'Formal',
    dressNote: 'Con mucho cariño les pedimos evitar prendas en color lavanda y morado.',
    numeroCuenta: '0000 0000 0000 0000',
    banco: 'Bancolombia',
    titularCuenta: 'Nombre del Titular',
    whatsapp: '573000000000',
    hashtag: '#MisXVValentina',
    closingText: 'Gracias por acompañarme en este día tan especial',
    showPadrinos: true,
    showItinerario: true,
    showRegalos: true,
    showHashtag: true
  };

  get data(): XvLilaData {
    return { ...this.defaultData, ...(this.invitationData ?? {}) };
  }

  // Countdown
  dias = 0;
  horas = 0;
  minutos = 0;
  segundos = 0;
  private countdownInterval?: ReturnType<typeof setInterval>;

  // Music
  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
  isPlaying = false;

  // Copy account
  cuentaCopiada = false;

  // RSVP form
  rsvpNombre = '';
  rsvpAsistentes = '1';
  rsvpMensaje = '';

  @ViewChildren('animSection') animSections!: QueryList<ElementRef<HTMLElement>>;
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    this.updateCountdown();
    this.countdownInterval = setInterval(() => this.updateCountdown(), 1000);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invitationData']) {
      this.updateCountdown();
    }
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    this.animSections.forEach((section) => this.observer?.observe(section.nativeElement));
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.observer?.disconnect();
  }

  private updateCountdown(): void {
    const eventDate = new Date(this.data.eventDate || this.defaultData.eventDate!);
    const diff = eventDate.getTime() - Date.now();
    if (diff <= 0) {
      this.dias = this.horas = this.minutos = this.segundos = 0;
      return;
    }
    this.dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    this.horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
    this.minutos = Math.floor((diff / (1000 * 60)) % 60);
    this.segundos = Math.floor((diff / 1000) % 60);
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

  copiarCuenta(): void {
    const cuenta = this.data.numeroCuenta || '';
    navigator.clipboard.writeText(cuenta).then(() => {
      this.cuentaCopiada = true;
      setTimeout(() => (this.cuentaCopiada = false), 2500);
    });
  }

  confirmarWhatsApp(): void {
    const nombre = this.rsvpNombre.trim() || 'Invitado';
    const quince = this.data.quinceanera;
    let texto = `Hola, soy ${nombre}. Confirmo mi asistencia a los XV de ${quince}. Asistentes: ${this.rsvpAsistentes}.`;
    if (this.rsvpMensaje.trim()) {
      texto += ` Mensaje: ${this.rsvpMensaje.trim()}`;
    }
    const whatsapp = this.data.whatsapp || this.defaultData.whatsapp;
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(texto)}`, '_blank');
  }
}
