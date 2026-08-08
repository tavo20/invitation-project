import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NeblinaInvitationData {
  heroImage: string;
  monogram: string;
  names1: string;
  names2: string;
  inicial_1: string;
  inicial_2: string;
  date: string;
  location: string;
  quote: string;
  countdownDate: string;
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
  ceremonyTitle: string;
  ceremonyTime: string;
  ceremonyPlace: string;
  ceremonyAddress: string;
  ceremonyButton: string;
  finalMessage: string;
  giftTitle: string;
}

@Component({
  selector: 'app-neblina',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './neblina.component.html',
  styleUrl: './neblina.component.scss'
})
export class NeblinaComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() invitationData: Partial<NeblinaInvitationData> | null = null;
  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
  @ViewChild('quoteSection') quoteSectionRef!: ElementRef<HTMLElement>;
  @ViewChild('saveDateSection') saveDateSectionRef!: ElementRef<HTMLElement>;
  @ViewChild('parentsSection') parentsSectionRef!: ElementRef<HTMLElement>;
  @ViewChild('storySection') storySectionRef!: ElementRef<HTMLElement>;
  @ViewChild('ceremonySection') ceremonySectionRef!: ElementRef<HTMLElement>;
  @ViewChild('finalSection') finalSectionRef!: ElementRef<HTMLElement>;

  isPlaying = false;
  days = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;
  currentStorySlide = 0;
  private countdownInterval?: ReturnType<typeof setInterval>;
  private carouselInterval?: ReturnType<typeof setInterval>;
  private observer?: IntersectionObserver;

  private readonly defaultData: NeblinaInvitationData = {
    heroImage: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/portada_neblina.jpeg',
    monogram: 'LS',
    names1: 'Lucía',
    names2: 'Santiago',
    date: '14 · 02 · 2027',
    location: '',
    inicial_1: 'L',
    
    inicial_2: 'S',
    quote: 'El amor nos unió para siempre y queremos compartir este gran día contigo.',
    countdownDate: 'February 14, 2027 18:00:00',
    parentsTitle: 'Con la bendición de nuestros padres',
    brideLabel: 'Novia',
    brideParent1: 'María Elena López',
    brideParent2: 'Jorge Andrés Rivera',
    groomLabel: 'Novio',
    groomParent1: 'Marta Cecilia Rojas',
    groomParent2: 'Luis Alberto Santiago',
    padrinosLabel: 'Padrinos',
    padrino1: 'Laura Martínez',
    padrino2: 'Andrés Salazar',
    storyTitle: 'Nuestra historia',
    storyText1: 'Todo comenzó con un encuentro inesperado, de esos que parecen escritos por el destino. Lo que empezó como una simple coincidencia se transformó rápidamente en una aventura favorita, llena de risas compartidas y apoyo incondicional.',
    storyText2: 'A través de momentos difíciles descubrimos que, cuando el amor es verdadero, siempre encuentra la forma de hacerse más fuerte. Hoy queremos seguir escribiendo este libro de la mano, celebrando el comienzo de un nuevo capítulo juntos.',
    storyImages: [
      'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/carru_1.jpeg',
      'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/carru_2.jpeg',
      'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/portada_neblina.jpeg'
    ],
    ceremonyTitle: 'Ceremonia',
    ceremonyTime: '6:30 PM',
    ceremonyPlace: 'Iglesia de Guadalupe',
    ceremonyAddress: 'San Francisco, calle 50',
    ceremonyButton: 'VER MAPA',
    finalMessage: '¡Los esperamos con muchísima ilusión para celebrar juntos este día tan especial!',
    giftTitle: 'Lluvia de sobres',
  };

  get data(): NeblinaInvitationData {
    return { ...this.defaultData, ...(this.invitationData ?? {}) };
  }

  formatNumber(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  ngOnInit(): void {
    this.startCountdown();
    this.startStoryCarousel();
  }

  setStorySlide(index: number): void {
    this.currentStorySlide = index;
  }

  togglePlayPause(): void {
    if (this.isPlaying) {
      this.audioPlayerRef.nativeElement.pause();
    } else {
      this.audioPlayerRef.nativeElement.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    this.observer?.disconnect();
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );

    if (this.quoteSectionRef) {
      this.observer.observe(this.quoteSectionRef.nativeElement);
    }

    if (this.saveDateSectionRef) {
      this.observer.observe(this.saveDateSectionRef.nativeElement);
    }

    if (this.parentsSectionRef) {
      this.observer.observe(this.parentsSectionRef.nativeElement);
    }

    if (this.storySectionRef) {
      this.observer.observe(this.storySectionRef.nativeElement);
    }

    if (this.ceremonySectionRef) {
      this.observer.observe(this.ceremonySectionRef.nativeElement);
    }

    if (this.finalSectionRef) {
      this.observer.observe(this.finalSectionRef.nativeElement);
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
}
