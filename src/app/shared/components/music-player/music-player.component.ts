import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Botón flotante de música para las invitaciones.
 * - El estado "sonando" sale de los eventos reales del <audio>, así el botón
 *   nunca queda marcado si el navegador bloquea el play.
 * - Con autoPlayOnFirstTouch la canción arranca en el primer toque/tecla del
 *   invitado (los celulares no permiten sonar sin interacción).
 * - Se pausa al cambiar de pestaña o de app y retoma al volver.
 */
@Component({
  selector: 'app-music-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './music-player.component.html',
  styleUrl: './music-player.component.scss'
})
export class MusicPlayerComponent implements AfterViewInit, OnDestroy {
  @Input() src = '';
  @Input() autoPlayOnFirstTouch = false;
  @Input() background = 'rgba(20, 20, 20, 0.85)';
  @Input() color = '#ffffff';

  @ViewChild('audio') audioRef?: ElementRef<HTMLAudioElement>;

  isPlaying = false;

  private resumeOnVisible = false;
  private readonly firstTouchEvents = ['pointerdown', 'keydown'];

  constructor(private host: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngAfterViewInit(): void {
    if (this.autoPlayOnFirstTouch) {
      this.firstTouchEvents.forEach((type) => document.addEventListener(type, this.onFirstTouch, { passive: true }));
    }
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  ngOnDestroy(): void {
    this.removeFirstTouchListeners();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.audioRef?.nativeElement.pause();
  }

  toggle(): void {
    const audio = this.audioRef?.nativeElement;
    if (!audio) return;
    if (audio.paused) {
      this.play();
    } else {
      audio.pause();
    }
  }

  onPlay(): void {
    this.isPlaying = true;
  }

  onPause(): void {
    this.isPlaying = false;
  }

  private play(): void {
    // Si el navegador bloquea el play, el evento "play" nunca llega y el botón sigue en pausa.
    this.audioRef?.nativeElement.play().catch(() => undefined);
  }

  private onFirstTouch = (event: Event): void => {
    this.removeFirstTouchListeners();
    // Un toque sobre el propio botón ya lo maneja toggle().
    if (this.host.nativeElement.contains(event.target as Node)) return;
    this.zone.run(() => this.play());
  };

  private onVisibilityChange = (): void => {
    const audio = this.audioRef?.nativeElement;
    if (!audio) return;
    if (document.hidden) {
      this.resumeOnVisible = !audio.paused;
      audio.pause();
    } else if (this.resumeOnVisible) {
      this.resumeOnVisible = false;
      this.zone.run(() => this.play());
    }
  };

  private removeFirstTouchListeners(): void {
    this.firstTouchEvents.forEach((type) => document.removeEventListener(type, this.onFirstTouch));
  }
}
