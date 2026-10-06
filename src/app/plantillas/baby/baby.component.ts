import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

interface BabyData {
  heroImage: string;
  cloudImage: string;
  title: string;
  subtitle: string;
  kicker: string;
  babyName: string;
  ecoImage: string;
  heartbeatSrc?: string;
  heartbeatLabel: string;
  parentsLabel: string;
  musicSrc?: string;
  autoPlayMusic?: boolean;
  // detalles
  message: string;
  parentsImage: string;
  parentsPhoto?: string;
  parentsPhotoPosition?: string;
  parentsImagePosition?: string;
  parentsVideo?: string;
  parentsVideoPoster?: string;
  parentsNames: string;
  guestNames: string;
  celebrateText: string;
  dayOfWeek: string;
  dayNumber: string;
  month: string;
  time: string;
  placeLabel: string;
  placeName: string;
  placeAddress?: string;
  mapLink?: string;
  mapButtonText: string;
  // regalo
  giftHighlight: string;
  giftText: string;
  // confirmación
  confirmQuestion: string;
  confirmButtonText: string;
  confirmLink?: string;
}

interface Decoration {
  left: number;   // % del ancho
  top: number;    // px desde arriba de la portada
  size: number;   // ancho en % del contenedor
  delay?: number; // s, para que no floten todas al mismo tiempo
  flip?: boolean;
}

@Component({
  selector: 'app-baby',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './baby.component.html',
  styleUrl: './baby.component.scss'
})
export class BabyComponent implements AfterViewInit, OnDestroy {
  @Input() invitationData: Partial<BabyData> | null = null;
  @Input() confirmation: any = null;

  @ViewChild('heartbeatAudio') heartbeatAudioRef?: ElementRef<HTMLAudioElement>;
  @ViewChild('heartbeatCanvas') heartbeatCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('musicAudio') musicAudioRef?: ElementRef<HTMLAudioElement>;
  @ViewChild('parentsVideoEl') parentsVideoRef?: ElementRef<HTMLVideoElement>;

  musicPlaying = false;
  /** La música se pausó porque sonaron los latidos o el video; al terminar, debe continuar. */
  private musicPausedForOther = false;
  private firstTouchHandled = false;

  heartbeatPlaying = false;

  /** amplitud (0–1) de cada columna de la onda, calculada del audio real */
  private peaks: number[] = [];
  private audioCtx?: AudioContext;
  private analyser?: AnalyserNode;
  private levelData?: Uint8Array;
  private rafId: number | null = null;
  private resizeObserver?: ResizeObserver;

  constructor(private zone: NgZone) {}

  private readonly defaultData: BabyData = {
    heroImage: 'assets/baby/conejita.png',
    cloudImage: 'assets/baby/nube.png',
    title: 'Baby',
    subtitle: 'Shower',
    kicker: 'La dulce espera de',
    babyName: 'Azul',
    ecoImage: 'assets/baby/eco.jpg',
    heartbeatSrc: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Cliente_Marca/Baby/latidos.mp3',
    heartbeatLabel: 'Escucha mis latidos',
    parentsLabel: 'Mis papitos',
    parentsPhoto: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Cliente_Marca/Baby/us.jpg',
    parentsPhotoPosition: 'center 28%',
    musicSrc: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Cliente_Marca/Baby/cancion_azuk.mp3',
    autoPlayMusic: true,
    message: 'Sé que me esperan con amor y emoción, por eso deseo que compartas con ellos esta hermosa espera. ¡Muy pronto estaremos juntos!',
    parentsImage: 'assets/new-claude-our/basic_02.jpg',
    parentsImagePosition: 'center 30%',
    parentsVideo: 'assets/baby/revelacion.mp4',
    parentsVideoPoster: 'assets/baby/revelacion-poster.jpg',
    parentsNames: 'Gustavo & Gissel',
    guestNames: 'Juan & Laura',
    celebrateText: 'Acompáñanos a celebrar el día',
    dayOfWeek: 'Domingo',
    dayNumber: '25',
    month: 'Octubre',
    time: '3:00 PM',
    placeLabel: 'Lugar',
    placeName: 'Segundo piso Pan de Oro',
    placeAddress: '',
    mapLink: 'https://maps.app.goo.gl/BkTY9MEaYLakEoKG7',
    mapButtonText: 'Mapa de ubicación',
    giftHighlight: 'Tu presencia es importante,',
    giftText: 'el mejor regalo que podemos recibir',
    confirmQuestion: '¿Nos acompañas?',
    confirmButtonText: 'Confirmar asistencia',
    confirmLink: ''
  };

  /** Nubes repartidas como en la referencia: a los lados, a distintas alturas */
  readonly clouds: Decoration[] = [
    { left: -12, top: 150, size: 38, delay: 0 },
    { left: 72, top: 120, size: 36, delay: 1.2, flip: true },
    { left: 30, top: 300, size: 22, delay: 2.4 },
    { left: 80, top: 330, size: 26, delay: 0.6 },
    { left: -14, top: 360, size: 34, delay: 1.8, flip: true },
    { left: 76, top: 560, size: 34, delay: 0.9 },
    { left: 4, top: 650, size: 28, delay: 2.1, flip: true },
    { left: -10, top: 820, size: 24, delay: 1.5 },
    { left: 82, top: 990, size: 26, delay: 0.3, flip: true }
  ];

  /** Estrellitas doradas */
  readonly stars: Decoration[] = [
    { left: 16, top: 290, size: 4 },
    { left: 72, top: 300, size: 4.4 },
    { left: 88, top: 470, size: 3.6 },
    { left: 6, top: 590, size: 4 },
    { left: 90, top: 760, size: 3.8 },
    { left: 8, top: 1010, size: 3.6 }
  ];

  /** Decoración de la sección de detalles (top en px desde el inicio de la sección) */
  readonly detailClouds: Decoration[] = [
    { left: -16, top: 20, size: 32, delay: 0.4, flip: true },
    { left: 80, top: 110, size: 30, delay: 1.6 },
    { left: -14, top: 520, size: 30, delay: 2.2 },
    { left: 84, top: 1010, size: 30, delay: 0.8, flip: true },
    { left: -12, top: 930, size: 28, delay: 1.2 }
  ];

  readonly detailStars: Decoration[] = [
    { left: 90, top: 10, size: 3.8 },
    { left: 6, top: 250, size: 4 },
    { left: 90, top: 330, size: 3.6 },
    { left: 84, top: 640, size: 4 },
    { left: 6, top: 760, size: 3.8 },
    { left: 92, top: 960, size: 3.6 }
  ];

  readonly giftClouds: Decoration[] = [
    { left: 82, top: 150, size: 26, delay: 1.1 },
    { left: -10, top: 300, size: 30, delay: 0.5, flip: true }
  ];

  readonly giftStars: Decoration[] = [
    { left: 14, top: 20, size: 4 },
    { left: 90, top: 0, size: 3.8 },
    { left: 4, top: 190, size: 3.6 },
    { left: 88, top: 330, size: 3.8 }
  ];

  /**
   * Angular no deja el atributo `muted` puesto en el <video>, y sin él los navegadores
   * bloquean la reproducción automática. Lo forzamos aquí y le damos play.
   */
  /** El video arranca en silencio; el invitado activa el sonido con el botón. */
  videoMuted = true;

  toggleVideoSound(video: HTMLVideoElement): void {
    video.muted = !video.muted;
    this.videoMuted = video.muted;
    if (!video.muted) {
      // el video con sonido tiene prioridad: pausa los latidos y la música
      this.heartbeatAudioRef?.nativeElement.pause();
      this.pauseMusicForOther();
      if (video.paused) video.play().catch(() => undefined);
    } else {
      this.resumeMusicIfNoOther();
    }
  }

  playMuted(event: Event): void {
    const video = event.target as HTMLVideoElement;
    // solo la primera vez: si el invitado ya activó el sonido, no lo volvemos a silenciar
    if (this.videoMuted) {
      video.muted = true;
      video.defaultMuted = true;
    }
    if (video.paused) {
      video.play().catch(() => undefined);
    }
  }

  // ---------- Latidos: onda de puntos dibujada con el audio real ----------

  ngAfterViewInit(): void {
    if (this.data.musicSrc && this.data.autoPlayMusic) {
      document.addEventListener('pointerdown', this.onFirstTouch, { passive: true });
    }
    const canvas = this.heartbeatCanvasRef?.nativeElement;
    if (!canvas || !this.data.heartbeatSrc) return;
    this.resizeObserver = new ResizeObserver(() => this.drawWave());
    this.resizeObserver.observe(canvas);
    void this.loadPeaks(this.data.heartbeatSrc);
  }

  ngOnDestroy(): void {
    this.stopLoop();
    this.resizeObserver?.disconnect();
    this.heartbeatAudioRef?.nativeElement.pause();
    this.musicAudioRef?.nativeElement.pause();
    this.removeFirstTouch();
    void this.audioCtx?.close();
  }

  toggleHeartbeat(): void {
    const audio = this.heartbeatAudioRef?.nativeElement;
    if (!audio) return;
    if (audio.paused) {
      this.connectAnalyser(audio);
      void this.audioCtx?.resume();
      audio.play().catch(() => undefined);
    } else {
      audio.pause();
    }
  }

  onHeartbeatPlay(): void {
    this.heartbeatPlaying = true;
    this.startLoop();
    // los latidos tienen prioridad: pausa la música y silencia el video
    this.pauseMusicForOther();
    this.muteVideo();
  }

  onHeartbeatPause(): void {
    this.heartbeatPlaying = false;
    this.stopLoop();
    this.drawWave();
    this.resumeMusicIfNoOther();
  }

  // ---------- Música de fondo (botón flotante) ----------

  toggleMusic(): void {
    const audio = this.musicAudioRef?.nativeElement;
    if (!audio) return;
    this.firstTouchHandled = true;
    this.musicPausedForOther = false;
    if (audio.paused) {
      // si el invitado pide música, se callan los latidos y el video
      this.heartbeatAudioRef?.nativeElement.pause();
      this.muteVideo();
      audio.play().catch(() => undefined);
    } else {
      audio.pause();
    }
  }

  onMusicPlay(): void {
    this.musicPlaying = true;
  }

  onMusicPause(): void {
    this.musicPlaying = false;
  }

  /** La música arranca con el primer toque del invitado (los celulares no dejan sonar sin un toque). */
  private onFirstTouch = (event: Event): void => {
    this.removeFirstTouch();
    if (this.firstTouchHandled) return;
    this.firstTouchHandled = true;
    // si el primer toque es en los latidos, el video o el botón de música, ese control decide
    const target = event.target as HTMLElement | null;
    if (target?.closest('.heartbeat, .video-sound, .music-fab')) return;
    this.zone.run(() => this.musicAudioRef?.nativeElement.play().catch(() => undefined));
  };

  private removeFirstTouch(): void {
    document.removeEventListener('pointerdown', this.onFirstTouch);
  }

  private pauseMusicForOther(): void {
    const audio = this.musicAudioRef?.nativeElement;
    if (audio && !audio.paused) {
      this.musicPausedForOther = true;
      audio.pause();
    }
  }

  /** Retoma la música solo si la habían pausado por otro audio y ya no suena nada más. */
  private resumeMusicIfNoOther(): void {
    if (!this.musicPausedForOther || this.heartbeatPlaying || !this.videoMuted) return;
    this.musicPausedForOther = false;
    this.musicAudioRef?.nativeElement.play().catch(() => undefined);
  }

  private muteVideo(): void {
    const video = this.parentsVideoRef?.nativeElement;
    if (video && !video.muted) {
      video.muted = true;
    }
    this.videoMuted = true;
  }

  /** Descarga el audio y calcula la altura de cada columna de puntos. */
  private async loadPeaks(src: string): Promise<void> {
    try {
      const buffer = await (await fetch(src)).arrayBuffer();
      const decoder = new OfflineAudioContext(1, 1, 44100);
      const audio = await decoder.decodeAudioData(buffer);
      const data = audio.getChannelData(0);
      const columns = 64;
      const block = Math.floor(data.length / columns);
      const raw: number[] = [];
      for (let c = 0; c < columns; c++) {
        let sum = 0;
        for (let i = 0; i < block; i++) {
          const v = data[c * block + i];
          sum += v * v;
        }
        raw.push(Math.sqrt(sum / block));
      }
      const max = Math.max(...raw) || 1;
      // curva suave para que los latidos se noten y el silencio no desaparezca
      this.peaks = raw.map((v) => Math.max(0.06, Math.pow(v / max, 0.7)));
    } catch {
      // si no se puede leer el audio, una onda decorativa de latidos
      this.peaks = Array.from({ length: 64 }, (_, i) => {
        const t = (i % 22) / 22;
        return 0.08 + 0.9 * Math.exp(-Math.pow((t - 0.25) * 9, 2)) + 0.6 * Math.exp(-Math.pow((t - 0.45) * 9, 2));
      });
    }
    this.drawWave();
  }

  /** Conecta el analizador la primera vez que el invitado da play (requiere el toque). */
  private connectAnalyser(audio: HTMLAudioElement): void {
    if (this.audioCtx) return;
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new Ctx();
      const source = this.audioCtx.createMediaElementSource(audio);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 512;
      this.levelData = new Uint8Array(this.analyser.fftSize);
      source.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    } catch {
      this.analyser = undefined;
    }
  }

  private startLoop(): void {
    this.stopLoop();
    this.zone.runOutsideAngular(() => {
      const frame = () => {
        this.drawWave();
        this.rafId = requestAnimationFrame(frame);
      };
      this.rafId = requestAnimationFrame(frame);
    });
  }

  private stopLoop(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  /** Nivel de volumen actual (0–1) para que la onda "respire" con cada latido. */
  private currentLevel(): number {
    if (!this.analyser || !this.levelData) return 0;
    this.analyser.getByteTimeDomainData(this.levelData);
    let sum = 0;
    for (const v of this.levelData) {
      const d = (v - 128) / 128;
      sum += d * d;
    }
    return Math.min(1, Math.sqrt(sum / this.levelData.length) * 4);
  }

  private drawWave(): void {
    const canvas = this.heartbeatCanvasRef?.nativeElement;
    const audio = this.heartbeatAudioRef?.nativeElement;
    if (!canvas || !this.peaks.length) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const mid = height / 2;
    const cols = this.peaks.length;
    const step = width / cols;
    const dot = Math.max(1.3, Math.min(step * 0.32, 2));
    const gap = dot * 2.5;
    const maxDots = Math.floor((mid - dot) / gap);

    const progress = audio && audio.duration ? audio.currentTime / audio.duration : 0;
    const playhead = progress * cols;
    const level = this.heartbeatPlaying ? this.currentLevel() : 0;

    // línea central
    ctx.fillStyle = '#e4cfca';
    ctx.fillRect(0, mid - 0.75, width, 1.5);

    for (let c = 0; c < cols; c++) {
      const x = step * c + step / 2;
      // las columnas cerca del punto que suena "saltan" con el volumen real
      const near = Math.max(0, 1 - Math.abs(c - playhead) / 7);
      const boost = this.heartbeatPlaying ? 1 + level * near * 0.9 : 1;
      const dots = Math.max(1, Math.round(this.peaks[c] * maxDots * Math.min(boost, 1.6)));
      const played = this.heartbeatPlaying || progress > 0 ? c <= playhead : false;
      ctx.fillStyle = played ? '#b6837c' : '#d9bdb7';

      for (let d = 0; d <= dots; d++) {
        const off = d * gap;
        if (off > mid - dot) break;
        ctx.beginPath();
        ctx.arc(x, mid - off, dot, 0, Math.PI * 2);
        ctx.fill();
        if (d > 0) {
          ctx.beginPath();
          ctx.arc(x, mid + off, dot, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  /** Nombre del invitado: el de su enlace personal si existe; si no, el de los datos. */
  get guestNames(): string {
    return (this.confirmation?.names || '').trim() || this.data.guestNames;
  }

  get data(): BabyData {
    return { ...this.defaultData, ...(this.invitationData ?? {}) };
  }
}
