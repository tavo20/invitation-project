import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AzulGrisColoresCountDownComponent } from './components/count-down/azul-gris-colores-count-down.component';

type PaletteName = 'navy' | 'slate' | 'forest' | 'wine';

interface InvitationPalette {
  bg: string;
  bgAlt: string;
  silver: string;
  textLight: string;
  textSecondary: string;
  textMuted: string;
}

interface AzulGrisInvitationData {
  palette?: PaletteName;
}

@Component({
  selector: 'app-azul-gris-colores',
  standalone: true,
  imports: [AzulGrisColoresCountDownComponent, CommonModule],
  templateUrl: './azul-gris-colores.component.html',
  styleUrl: './azul-gris-colores.component.scss'
})
export class AzulGrisColoresComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() invitationData: Partial<AzulGrisInvitationData> | null = null;

  weddingDate: string = "December 18, 2026 16:00:00";
  selectedPalette: PaletteName = 'navy';

  readonly palettes: Record<PaletteName, InvitationPalette> = {
    navy: {
      bg: '#0F1626',
      bgAlt: '#161F33',
      silver: '#AFC1DD',
      textLight: '#EAEFF7',
      textSecondary: '#B9C3D6',
      textMuted: '#8291AC'
    },
    slate: {
      bg: '#1B1D21',
      bgAlt: '#26292F',
      silver: '#C5C8CE',
      textLight: '#F3F4F6',
      textSecondary: '#B8BCC4',
      textMuted: '#8A909A'
    },
    forest: {
      bg: '#121812',
      bgAlt: '#1B241C',
      silver: '#B7C7B0',
      textLight: '#F2F5EE',
      textSecondary: '#C4CFBE',
      textMuted: '#879384'
    },
    wine: {
      bg: '#1A1216',
      bgAlt: '#26181E',
      silver: '#D4B4BE',
      textLight: '#F7EEF1',
      textSecondary: '#D2C0C6',
      textMuted: '#A38891'
    }
  };

  readonly paletteOptions: { key: PaletteName; label: string }[] = [
    { key: 'navy', label: 'Navy' },
    { key: 'slate', label: 'Gris' },
    { key: 'forest', label: 'Verde' },
    { key: 'wine', label: 'Vino' }
  ];

  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
  isPlaying: boolean = false;

  constructor(private host: ElementRef<HTMLElement>) {}

  get colors(): InvitationPalette {
    return this.palettes[this.selectedPalette] ?? this.palettes.navy;
  }

  get paletteVars(): Record<string, string> {
    const colors = this.colors;
    return {
      '--bg': colors.bg,
      '--bg-alt': colors.bgAlt,
      '--silver': colors.silver,
      '--text-light': colors.textLight,
      '--text-secondary': colors.textSecondary,
      '--text-muted': colors.textMuted
    };
  }

  ngOnInit(): void {
    this.applyIncomingPalette();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invitationData']) {
      this.applyIncomingPalette();
    }
  }

  private applyIncomingPalette(): void {
    const incoming = this.invitationData?.palette;
    if (incoming && this.palettes[incoming]) {
      this.selectedPalette = incoming;
    }
  }

  setPalette(palette: PaletteName): void {
    this.selectedPalette = palette;
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
