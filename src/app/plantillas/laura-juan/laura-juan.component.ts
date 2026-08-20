import { Component, ElementRef, HostListener, QueryList, ViewChild, ViewChildren, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LauraJuanCountDownComponent } from './components/count-down/laura-juan-count-down.component';

interface LauraJuanData {
  heroImage?: string;
  names1?: string;
  names2?: string;
  dateText?: string;
  weddingDate?: string;
  eventLocation?: string;
  heroPretitle?: string;
  heroTitle?: string;
  heroMessage?: string;
  quote?: string;
  quoteReference?: string;
  parallaxImage1?: string;
  parallaxImage2?: string;
  eventTitle?: string;
  eventMapLink?: string;
  eventMapLabel?: string;
  audioSrc?: string;
  confirmLink?: string;
  timeline?: { time: string; desc: string; spam?: string }[];
  eventButtonText?: string;
  dressType?: string;
  dressWomenDesc?: string;
  dressMenDesc?: string;
  dressNote?: string;
  confirmTitle?: string;
  confirmMessage?: string;
  confirmButtonText?: string;
  sobresTitle?: string;
  sobresMessage?: string;
  finalHighlight?: string;
  finalText1?: string;
  finalText2?: string;
  closingFinal?: string;
  instragramCliente?: string;
}


@Component({
  selector: 'app-laura-juan',
  standalone: true,
  imports: [LauraJuanCountDownComponent, CommonModule],
  templateUrl: './laura-juan.component.html',
  styleUrl: './laura-juan.component.scss'
})
export class LauraJuanComponent implements AfterViewInit, OnChanges {

  @Input() invitationData: Partial<LauraJuanData> | null = null;

  weddingDate: string = "December 18, 2026 16:00:00";
  heroImage: string = 'assets/new-claude-our/portada.jpg';
  names1: string = 'Laura';
  names2: string = 'Juan';
  dateText: string = '18 · 07 · 2026';
  eventLocation: string = 'CAJICÁ, CUNDINAMARCA';
  heroPretitle: string = 'Nos casamos';
  heroTitle: string = 'NOS CASAMOS';
  heroMessage: string = 'Bajo un mismo cielo escribimos nuestra historia, y esta noche queremos compartir contigo el comienzo del capítulo más hermoso.';
  quote: string = '\"Nuestro amor estaba escrito en las estrellas, <br>y hoy el cielo entero celebra con nosotros.\"';
  quoteReference: string = '';
  parallaxImage1: string = 'assets/new-claude-our/basic_01.jpg';
  parallaxImage2: string = 'assets/new-claude-our/basic_02.jpg';
  eventTitle: string = 'Ceremonia y Recepción';
  timeline: { time: string; desc: string; spam?: string }[] = [
    { time: '4:00 PM', desc: 'Ceremonia' },
    { time: '5:30 PM', desc: 'Cóctel de bienvenida' },
    { time: '7:00 PM', desc: 'Recepción' },
    { time: '9:00 PM', desc: 'Fiesta' }
  ];
  eventButtonText: string = 'VER UBICACIÓN';
  eventMapLink: string = '';
  eventMapLabel: string = '';
  audioSrc: string = '';
  dressType: string = 'Formal Nocturno';
  dressWomenDesc: string = 'Vestido largo o cóctel.';
  dressMenDesc: string = 'Traje oscuro.';
  dressNote: string = 'El color blanco está reservado para la novia.';
  confirmTitle: string = 'Confirma tu Asistencia';
  confirmMessage: string = 'Hemos pensado en ti porque eres parte de nuestra historia. Queremos contar contigo esa noche.';
  confirmButtonText: string = 'CONFIRMA AQUÍ';
  confirmLink: string = '#';
  sobresTitle: string = 'Lluvia de Sobres';
  sobresMessage: string = '';
  finalHighlight: string = 'Nos vemos bajo las estrellas';
  finalText1: string = 'Tenemos la luna, la música y cada detalle preparado…';
  finalText2: string = 'Solo falta lo más importante: tú.';
  closingFinal: string = 'Laura & Juan';
  instragramCliente: string = '';

  private readonly defaultData: LauraJuanData = {
    heroImage: 'assets/new-claude-our/portada.jpg',
    names1: 'Laura',
    names2: 'Juan',
    dateText: '18 · 07 · 2026',
    weddingDate: 'December 18, 2026 16:00:00',
    eventLocation: 'CAJICÁ, CUNDINAMARCA'
    ,
    heroPretitle: 'Nos casamos',
    heroTitle: 'NOS CASAMOS',
    heroMessage: 'Bajo un mismo cielo escribimos nuestra historia, y esta noche queremos compartir contigo el comienzo del capítulo más hermoso.',
    quote: '\"Nuestro amor estaba escrito en las estrellas, <br>y hoy el cielo entero celebra con nosotros.\"',
    quoteReference: '',
    parallaxImage1: 'assets/new-claude-our/basic_01.jpg',
    parallaxImage2: 'assets/new-claude-our/basic_02.jpg',
    eventTitle: 'Ceremonia y Recepción',
    timeline: [
      { time: '4:00 PM', desc: 'Ceremonia' },
      { time: '5:30 PM', desc: 'Cóctel de bienvenida' },
      { time: '7:00 PM', desc: 'Recepción' },
      { time: '9:00 PM', desc: 'Fiesta' }
    ],
    eventButtonText: 'VER UBICACIÓN',
    eventMapLink: 'aaa',
    eventMapLabel: '',
    audioSrc: '',
    dressType: 'Formal Nocturno',
    dressWomenDesc: 'Vestido largo o cóctel.',
    dressMenDesc: 'Traje oscuro.',
    dressNote: 'El color blanco está reservado para la novia.',
    confirmTitle: 'Confirma tu Asistencia',
    confirmMessage: 'Hemos pensado en ti porque eres parte de nuestra historia. Queremos contar contigo esa noche.',
    confirmButtonText: 'CONFIRMA AQUÍ',
    confirmLink: '#',
    sobresTitle: 'Lluvia de Sobres',
    sobresMessage: '',
    finalHighlight: 'Nos vemos bajo las estrellas',
    finalText1: 'Tenemos la luna, la música y cada detalle preparado…',
    finalText2: 'Solo falta lo más importante: tú.',
    closingFinal: 'Laura & Juan',
    instragramCliente: ''
  };

  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
  isPlaying: boolean = false;

  constructor(private host: ElementRef<HTMLElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invitationData']) {
      this.applyIncomingData();
    }
  }

  private applyIncomingData(): void {
    console.log('this.invitationData', this.invitationData);
    const incoming = this.invitationData ?? {};
    this.heroImage = incoming.heroImage ?? this.defaultData.heroImage!;
    this.names1 = incoming.names1 ?? this.defaultData.names1!;
    this.names2 = incoming.names2 ?? this.defaultData.names2!;
    this.dateText = incoming.dateText ?? this.defaultData.dateText!;
    this.weddingDate = incoming.weddingDate ?? this.defaultData.weddingDate!;
    this.eventLocation = incoming.eventLocation ?? this.defaultData.eventLocation!;
    this.heroPretitle = incoming.heroPretitle ?? this.defaultData.heroPretitle!;
    this.heroTitle = incoming.heroTitle ?? this.defaultData.heroTitle!;
    this.heroMessage = incoming.heroMessage ?? this.defaultData.heroMessage!;
    this.quote = incoming.quote ?? this.defaultData.quote!;
    this.quoteReference = incoming.quoteReference ?? this.defaultData.quoteReference!;
    this.parallaxImage1 = incoming.parallaxImage1 ?? this.defaultData.parallaxImage1!;
    this.parallaxImage2 = incoming.parallaxImage2 ?? this.defaultData.parallaxImage2!;
    this.eventTitle = incoming.eventTitle ?? this.defaultData.eventTitle!;
    this.timeline = incoming.timeline ?? this.defaultData.timeline!;
    this.eventButtonText = incoming.eventButtonText ?? this.defaultData.eventButtonText!;
    this.eventMapLink = incoming.eventMapLink ?? this.defaultData.eventMapLink ?? '#';
    this.eventMapLabel = incoming.eventMapLabel ?? this.defaultData.eventMapLabel ?? '';
    this.audioSrc = incoming.audioSrc ?? this.defaultData.audioSrc ?? '';
    this.dressType = incoming.dressType ?? this.defaultData.dressType!;
    this.dressWomenDesc = incoming.dressWomenDesc ?? this.defaultData.dressWomenDesc!;
    this.dressMenDesc = incoming.dressMenDesc ?? this.defaultData.dressMenDesc!;
    this.dressNote = incoming.dressNote ?? this.defaultData.dressNote!;
    this.confirmTitle = incoming.confirmTitle ?? this.defaultData.confirmTitle!;
    this.confirmMessage = incoming.confirmMessage ?? this.defaultData.confirmMessage!;
    this.confirmButtonText = incoming.confirmButtonText ?? this.defaultData.confirmButtonText!;
    this.confirmLink = incoming.confirmLink ?? this.defaultData.confirmLink ?? '#';
    this.sobresTitle = incoming.sobresTitle ?? this.defaultData.sobresTitle!;
    this.sobresMessage = incoming.sobresMessage ?? this.defaultData.sobresMessage!;
    this.finalHighlight = incoming.finalHighlight ?? this.defaultData.finalHighlight!;
    this.finalText1 = incoming.finalText1 ?? this.defaultData.finalText1!;
    this.finalText2 = incoming.finalText2 ?? this.defaultData.finalText2!;
    this.closingFinal = incoming.closingFinal ?? this.defaultData.closingFinal!;
    this.instragramCliente = incoming.instragramCliente ?? this.defaultData.instragramCliente ?? '';
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

  ngAfterViewInit(): void {
    const revealables = this.host.nativeElement.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    revealables.forEach((el) => observer.observe(el));
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
