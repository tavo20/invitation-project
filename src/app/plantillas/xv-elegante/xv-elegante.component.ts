import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-xv-elegante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './xv-elegante.component.html',
  styleUrl: './xv-elegante.component.scss'
})
export class XvEleganteComponent implements OnInit, AfterViewInit, OnDestroy {

  // ===== Datos del evento (personalizar por cliente) =====
  quinceanera = 'Gabi';
  fechaTexto = 'Viernes 28 de Noviembre, 2026';
  eventDate = new Date('November 28, 2026 18:00:00');

  ceremonia = {
    lugar: 'Iglesia Espíritu Santo',
    hora: '6:00 PM',
    direccion: 'Palacio de Justicia No. 500, Anáhuac',
    mapa: 'https://maps.google.com'
  };

  recepcion = {
    lugar: 'Atrium Eventos',
    hora: '8:00 PM',
    direccion: 'Av. Manuel L. Barragán 325, Anáhuac',
    mapa: 'https://maps.google.com'
  };

  itinerario = [
    { hora: '6:00 PM', titulo: 'Ceremonia Religiosa' },
    { hora: '7:30 PM', titulo: 'Presentación' },
    { hora: '9:00 PM', titulo: 'Celebración' },
    { hora: '10:00 PM', titulo: '¡A bailar!' }
  ];

  numeroCuenta = 'ES99 0000 0000 0000';
  banco = 'Bancolombia';
  titularCuenta = 'Nombre del Titular';
  whatsapp = '573000000000';
  hashtag = '#MisXVAndrea';

  // ===== Countdown =====
  dias = 0;
  horas = 0;
  minutos = 0;
  segundos = 0;
  private countdownInterval?: ReturnType<typeof setInterval>;

  // ===== Musica =====
  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
  isPlaying = false;

  // ===== Copiar cuenta =====
  cuentaCopiada = false;

  // ===== Formulario de confirmacion =====
  rsvpNombre = '';
  rsvpAsistentes = '1';
  rsvpMensaje = '';

  @ViewChildren('animSection') animSections!: QueryList<ElementRef<HTMLElement>>;
  private observer?: IntersectionObserver;

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
    this.animSections.forEach((section) => this.observer?.observe(section.nativeElement));
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.observer?.disconnect();
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
  }

  copiarCuenta(): void {
    navigator.clipboard.writeText(this.numeroCuenta).then(() => {
      this.cuentaCopiada = true;
      setTimeout(() => (this.cuentaCopiada = false), 2500);
    });
  }

  confirmarWhatsApp(): void {
    const nombre = this.rsvpNombre.trim() || 'Invitado';
    let texto = `Hola, soy ${nombre}. Confirmo mi asistencia a los XV de ${this.quinceanera}. Asistentes: ${this.rsvpAsistentes}.`;
    if (this.rsvpMensaje.trim()) {
      texto += ` Mensaje: ${this.rsvpMensaje.trim()}`;
    }
    window.open(`https://wa.me/${this.whatsapp}?text=${encodeURIComponent(texto)}`, '_blank');
  }
}
