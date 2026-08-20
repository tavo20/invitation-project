import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountDownComponent } from '../../shared/components/count-down/count-down.component';

@Component({
  selector: 'app-flow-plantilla',
  standalone: true,
  imports: [CommonModule, CountDownComponent],
  templateUrl: './flow-plantilla.component.html',
  styleUrl: './flow-plantilla.component.scss'
})
export class FlowPlantillaComponent {
  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;

  weddingDate = 'November 26, 2030 20:00:00';
  songTitle = 'Perfect';
  songArtist = 'Ed Sheeran';
  audioSrc = 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Songs/Ed%20Sheeran%20-%20Perfect.mp3';

  isPlaying = false;
  isRepeat = false;
  isShuffle = false;
  progress = 0;
  currentTime = 0;
  duration = 0;

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

  toggleRepeat(): void {
    this.isRepeat = !this.isRepeat;
    const audio = this.audioPlayerRef?.nativeElement;
    if (audio) {
      audio.loop = this.isRepeat;
    }
  }

  skip(seconds: number): void {
    const audio = this.audioPlayerRef?.nativeElement;
    if (!audio || !audio.duration) return;
    audio.currentTime = Math.min(audio.duration, Math.max(0, audio.currentTime + seconds));
    this.onTimeUpdate();
  }

  onTimeUpdate(): void {
    const audio = this.audioPlayerRef?.nativeElement;
    if (!audio?.duration) {
      this.progress = 0;
      return;
    }
    this.currentTime = audio.currentTime;
    this.duration = audio.duration;
    this.progress = (audio.currentTime / audio.duration) * 100;
  }

  onLoadedMetadata(): void {
    const audio = this.audioPlayerRef?.nativeElement;
    this.duration = audio?.duration || 0;
  }

  onAudioEnded(): void {
    if (this.isRepeat) return;
    this.isPlaying = false;
    this.progress = 0;
    this.currentTime = 0;
  }

  seekAudio(event: MouseEvent): void {
    const audio = this.audioPlayerRef?.nativeElement;
    const track = event.currentTarget as HTMLElement;
    if (!audio || !audio.duration) return;

    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    this.progress = ratio * 100;
    this.currentTime = audio.currentTime;
  }

  formatTime(seconds: number): string {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const rest = Math.floor(seconds % 60);
    return `${minutes}:${rest.toString().padStart(2, '0')}`;
  }
}
