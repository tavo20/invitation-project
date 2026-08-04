import { Component, ElementRef, HostListener, Input, QueryList, ViewChild, ViewChildren, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountDownComponent } from '../../shared/components/count-down/count-down.component';

interface GustavoGisselInvitationData {
  heroImage: string;
  heroPretitle: string;
  heroTitle: string;
  heroMessage: string;
  weddingDate: string;
  dayOfWeek: string;
  dayNumber: string;
  year: string;
  month: string;
  quote: string;
  quoteAuthor: string;
  fatherGroom: string;
  motherGroom: string;
  fatherBride: string;
  motherBride: string;
  eventTitle: string;
  eventVenue: string;
  eventAddress: string;
  eventHour: string;
  dressWomen: string;
  dressMen: string;
  dressNote: string;
  confirmMessage: string;
  sobresMessage: string;
  closingHighlight: string;
  closingText1: string;
  closingText2: string;
  closingFinal: string;
  parallaxImage1: string;
  parallaxImage2: string;
}

@Component({
  selector: 'app-gustavo-gissel',
  standalone: true,
  imports: [CountDownComponent, CommonModule],
  templateUrl: './gustavo-gissel.component.html',
  styleUrl: './gustavo-gissel.component.scss'
})
export class GustavoGisselComponent implements AfterViewInit {
  @Input() invitationData: Partial<GustavoGisselInvitationData> | null = null;

  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
  isPlaying: boolean = false;

  private readonly defaultData: GustavoGisselInvitationData = {
    heroImage: 'assets/new-claude-our/portada.jp',
    heroPretitle: 'Gustavo & Gissel',
    heroTitle: 'NOS CASAMOS',
    heroMessage: 'El amor nos encontró y hoy nuestros corazones laten con una misma ilusión. Queremos compartir contigo el día más importante de nuestras vidas, cuando uniremos nuestras almas y celebraremos el inicio de nuestra historia para siempre.',
    weddingDate: 'October 10, 2026 15:00:00',
    dayOfWeek: 'SÁBADO',
    dayNumber: '10',
    year: '2026',
    month: 'O C T',
    quote: '"Amar no es mirarse el uno al otro, es mirar juntos en la misma dirección."',
    quoteAuthor: 'Antoine de Saint-Exupéry',
    fatherGroom: 'Gustavo Jimenez',
    motherGroom: 'Dennis Lievano',
    fatherBride: 'Alicia Insuasty',
    motherBride: 'Guillermo Acosta',
    eventTitle: 'Ceremonia y Recepción',
    eventVenue: 'HACIENDA LOS FAROLES',
    eventAddress: 'Chía, Cundinamarca',
    eventHour: '3:00 PM',
    dressWomen: 'Divinas y elegantes.',
    dressMen: 'Traje elegante.',
    dressNote: 'Por favor, evita vestir de color verde claro, está reservado para la novia.',
    confirmMessage: 'Hemos pensado en ti porque has sido importante en nuestras vidas, queremos contar contigo.',
    sobresMessage: 'El mejor regalo será compartir este momento contigo. Si deseas tener un detalle con nosotros, agradecemos tu aporte en nuestra lluvia de sobres.',
    closingHighlight: 'A ponerse guapos, que nos vamos a casar!',
    closingText1: 'Tenemos el traje, el fotógrafo, las flores y cada detalle preparado...',
    closingText2: 'Pero nos hace falta lo más importante: <br>contar con tu presencia en este día tan especial.',
    closingFinal: 'Te esperamos para celebrar juntos <br>el comienzo de nuestra historia de amor!',
    // parallaxImage1: 'assets/new-claude-our/basic_01.jp',
    parallaxImage1: '',
    // parallaxImage2: 'assets/new-claude-our/basic_02.jp',
    parallaxImage2: '',
  };

  get data(): GustavoGisselInvitationData {
    return { ...this.defaultData, ...(this.invitationData ?? {}) };
  }

  get weddingDate(): string {
    return this.data.weddingDate;
  }

  togglePlayPause(): void {
    if (this.isPlaying) {
      this.audioPlayerRef.nativeElement.pause();
    } else {
      this.audioPlayerRef.nativeElement.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  @ViewChildren('parallaxImg') parallaxImgs!: QueryList<ElementRef<HTMLImageElement>>;
  @ViewChild('countdownSection') countdownSectionRef!: ElementRef<HTMLDivElement>;
  @ViewChild('eventSection') eventSectionRef!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    if (this.countdownSectionRef) observer.observe(this.countdownSectionRef.nativeElement);
    if (this.eventSectionRef) observer.observe(this.eventSectionRef.nativeElement);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.parallaxImgs) return;
    const windowHeight = window.innerHeight;
    this.parallaxImgs.forEach((imgRef) => {
      const container = imgRef.nativeElement.parentElement!;
      const rect = container.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > windowHeight) return;
      const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
      const offset = (progress - 0.5) * 100;
      imgRef.nativeElement.style.transform = `translateY(${offset}px)`;
    });
  }
}
