import { Component, ElementRef, HostListener, QueryList, ViewChild, ViewChildren, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountDownComponent } from '../../shared/components/count-down/count-down.component';

@Component({
  selector: 'app-laura-juan',
  standalone: true,
  imports: [CountDownComponent, CommonModule],
  templateUrl: './laura-juan.component.html',
  styleUrl: './laura-juan.component.scss'
})
export class LauraJuanComponent implements AfterViewInit {

  weddingDate: string = "July 18, 2026 16:00:00";

  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
  isPlaying: boolean = false;

  constructor(private host: ElementRef<HTMLElement>) {}

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
