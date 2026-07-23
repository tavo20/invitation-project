import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type InfoModalType = 'song' | 'dress' | 'tips' | 'gifts' | null;

@Component({
  selector: 'app-xv-deluxe-black',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './xv-deluxe-black.component.html',
  styleUrl: './xv-deluxe-black.component.scss'
})
export class XvDeluxeBlackComponent implements OnInit, AfterViewInit, OnDestroy {
  quinceanera = 'Florencia';
  subtitle = 'Mis 15 años';
  fechaTexto = 'Sábado 15 de Junio, 2028';
  eventDate = new Date('June 15, 2028 17:00:00');

  invitados = ['Juan García', 'Sofía García', 'Mateo García'];
  acompanante = '1 acompañante';

  evento = {
    dia: 'Sábado 15 de Junio - 17hs',
    lugar: 'Salon Avril',
    direccion: 'Av. Pergamino 203 - Bogotá',
    mapa: 'https://maps.google.com'
  };
  acompanteLabel = '1 acompañante';

  itinerario = [
    { hora: '17:00', titulo: 'Llegada de invitados' },
    { hora: '17:30', titulo: 'Bienvenida y fotos' },
    { hora: '18:30', titulo: 'Vals y brindis' },
    { hora: '20:00', titulo: 'Fiesta épica' }
  ];

  dressSummary = 'Una guía para que tu look acompañe la elegancia de la noche.';
  tipsSummary = 'Detalles para que disfrutes la celebración sin preocuparte por nada.';
  giftsSummary = 'Si quieres tener un gesto conmigo, la lluvia de sobres será perfecta.';
  songPrompt = '¿Cuál es la canción que no debe faltar en la fiesta?';
  closingMessage = 'Gracias por acompañarme en esta noche mágica, inolvidable y única.';
  hashtag = '#15Florencia';
  whatsapp = '573000000000';

  dias = 0;
  horas = 0;
  minutos = 0;
  segundos = 0;
  private countdownInterval?: ReturnType<typeof setInterval>;

  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
  @ViewChildren('revealSection') revealSections!: QueryList<ElementRef<HTMLElement>>;
  isPlaying = false;
  isMusicReady = false;
  showRSVPModal = false;
  currentInfoModal: InfoModalType = null;
  rsvpNombre = '';
  rsvpAsistentes = '1';
  rsvpMensaje = '';
  songName = '';
  songSuggestion = '';
  copyFeedback = false;

  private observer?: IntersectionObserver;
  private previousBodyOverflow = '';

  ngOnInit(): void {
    this.updateCountdown();
    this.countdownInterval = setInterval(() => this.updateCountdown(), 1000);
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
      { threshold: 0.2 }
    );

    this.revealSections.forEach((section) => this.observer?.observe(section.nativeElement));
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.observer?.disconnect();
    this.unlockScroll();
  }

  private updateCountdown(): void {
    const diff = this.eventDate.getTime() - Date.now();
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
    if (this.isPlaying) {
      this.audioPlayerRef.nativeElement.pause();
    } else {
      this.audioPlayerRef.nativeElement.play();
    }
    this.isPlaying = !this.isPlaying;
    this.isMusicReady = true;
  }

  openRSVPModal(): void {
    this.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.showRSVPModal = true;
  }

  closeRSVPModal(): void {
    this.showRSVPModal = false;
    this.unlockScroll();
  }

  confirmarAsistencia(): void {
    const nombre = this.rsvpNombre.trim() || 'Invitado';
    const texto = `Hola, soy ${nombre}. Confirmo mi asistencia a los XV de ${this.quinceanera}. Asistentes: ${this.rsvpAsistentes}.${this.rsvpMensaje.trim() ? ` Mensaje: ${this.rsvpMensaje.trim()}` : ''}`;
    window.open(`https://wa.me/${this.whatsapp}?text=${encodeURIComponent(texto)}`, '_blank');
    this.closeRSVPModal();
  }

  openInfoModal(type: Exclude<InfoModalType, null>): void {
    this.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.currentInfoModal = type;
  }

  closeInfoModal(): void {
    this.currentInfoModal = null;
    this.unlockScroll();
  }

  sugerirCancion(): void {
    const nombre = this.songName.trim() || 'Invitado';
    const song = this.songSuggestion.trim() || 'una canción especial';
    const texto = `Hola, soy ${nombre}. Sugerencia de canción para los XV de ${this.quinceanera}: ${song}.`;
    window.open(`https://wa.me/${this.whatsapp}?text=${encodeURIComponent(texto)}`, '_blank');
    this.songName = '';
    this.songSuggestion = '';
    this.closeInfoModal();
  }

  copiarHashtag(): void {
    navigator.clipboard.writeText(this.hashtag).then(() => {
      this.copyFeedback = true;
      setTimeout(() => (this.copyFeedback = false), 1800);
    });
  }

  private unlockScroll(): void {
    document.body.style.overflow = this.previousBodyOverflow;
  }
}
