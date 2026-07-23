import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-xv-carmesi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './xv-carmesi.component.html',
  styleUrl: './xv-carmesi.component.scss'
})
export class XvCarmesiComponent implements OnInit, AfterViewInit, OnDestroy {
  quinceanera = 'Valentina';
  fechaTexto = 'Sábado 18 de Noviembre, 2027';
  eventDate = new Date('November 18, 2027 18:00:00');

  ceremonia = {
    lugar: 'Iglesia por definir',
    hora: '6:00 PM',
    direccion: 'Ciudad por definir',
    mapa: 'https://maps.google.com'
  };

  recepcion = {
    lugar: 'Salón por definir',
    hora: '8:00 PM',
    direccion: 'Ciudad por definir',
    mapa: 'https://maps.google.com'
  };

  itinerario = [
    { hora: '6:00 PM', titulo: 'Ceremonia Religiosa' },
    { hora: '7:30 PM', titulo: 'Recepción de invitados' },
    { hora: '9:00 PM', titulo: 'Cena y celebración' },
    { hora: '11:00 PM', titulo: '¡A bailar!' }
  ];

  dressCodeLadies = 'Vestido formal o cóctel';
  dressCodeGentlemen = 'Traje elegante';
  dressCodeNote = 'Se reserva el color borgoña para la quinceañera';
  sobresMessage = 'El mejor regalo será compartir este momento contigo. Si deseas tener un detalle, agradecemos tu lluvia de sobres.';
  closingMessage = 'Tenemos todo listo para celebrar contigo este momento único. Solo nos hace falta tu presencia para completar esta historia.';
  hashtag = '#XVCarmesi';
  whatsapp = '573000000000';

  dias = 0;
  horas = 0;
  minutos = 0;
  segundos = 0;
  private countdownInterval?: ReturnType<typeof setInterval>;

  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
  @ViewChildren('animSection') animSections!: QueryList<ElementRef<HTMLElement>>;
  isPlaying = false;
  cuentaCopiada = false;
  rsvpNombre = '';
  rsvpAsistentes = '1';
  rsvpMensaje = '';
  showRsvpModal = false;

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

    this.animSections.forEach((section) => this.observer?.observe(section.nativeElement));
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
  }

  copiarCuenta(): void {
    navigator.clipboard.writeText('Por definir').then(() => {
      this.cuentaCopiada = true;
      setTimeout(() => (this.cuentaCopiada = false), 2500);
    });
  }

  openRsvpModal(): void {
    this.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.showRsvpModal = true;
  }

  closeRsvpModal(): void {
    this.showRsvpModal = false;
    this.unlockScroll();
  }

  confirmarAsistencia(): void {
    const nombre = this.rsvpNombre.trim() || 'Invitado';
    let texto = `Hola, soy ${nombre}. Confirmo mi asistencia a los XV de ${this.quinceanera}. Asistentes: ${this.rsvpAsistentes}.`;
    if (this.rsvpMensaje.trim()) {
      texto += ` Mensaje: ${this.rsvpMensaje.trim()}`;
    }
    window.open(`https://wa.me/${this.whatsapp}?text=${encodeURIComponent(texto)}`, '_blank');
    this.closeRsvpModal();
  }

  private unlockScroll(): void {
    document.body.style.overflow = this.previousBodyOverflow;
  }
}
