import { Component, ElementRef, HostListener, QueryList, ViewChild, ViewChildren, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountDownComponent } from '../../shared/components/count-down/count-down.component';

@Component({
  selector: 'app-gustavo-gissel',
  standalone: true,
  imports: [CountDownComponent, CommonModule],
  templateUrl: './gustavo-gissel.component.html',
  styleUrl: './gustavo-gissel.component.scss'
})
export class GustavoGisselComponent implements AfterViewInit {

  weddingDate: string = "October 10, 2026 15:00:00";

  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
  isPlaying: boolean = false;

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
