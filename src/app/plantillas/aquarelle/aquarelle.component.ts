import { Component, ElementRef, HostListener, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-aquarelle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aquarelle.component.html',
  styleUrl: './aquarelle.component.scss'
})
export class AquarelleComponent implements AfterViewInit {

  weddingDate: string = "December 20, 2026 17:00:00";

  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  hasEnded: boolean = false;
  private countdownInterval: any;

  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
  isPlaying: boolean = false;

  showEnvelopeModal: boolean = false;

  constructor(private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.startCountdown();

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
      { threshold: 0.15 }
    );
    revealables.forEach((el) => observer.observe(el));
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }

  private startCountdown(): void {
    const targetTime = new Date(this.weddingDate).getTime();
    const update = () => {
      const now = new Date().getTime();
      const distance = targetTime - now;
      if (distance < 0) {
        this.hasEnded = true;
        clearInterval(this.countdownInterval);
        return;
      }
      this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
    };
    update();
    this.countdownInterval = setInterval(update, 1000);
  }

  fmt(n: number): string {
    return n < 10 ? '0' + n : n.toString();
  }

  togglePlayPause(): void {
    if (this.isPlaying) {
      this.audioPlayerRef.nativeElement.pause();
    } else {
      this.audioPlayerRef.nativeElement.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  openEnvelope(): void {
    this.showEnvelopeModal = true;
  }

  closeModal(): void {
    this.showEnvelopeModal = false;
  }
}
