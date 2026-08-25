import { Component, ElementRef, HostListener, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CountDownComponent } from '../../shared/components/count-down/count-down.component';
import { EventComponent } from '../../shared/components/event/event.component';

@Component({
  selector: 'app-our-plantilla-nataly',
  standalone: true,
  imports: [CountDownComponent, EventComponent, CommonModule],
  templateUrl: './our-plantilla-copy.component.html',
  styleUrl: './our-plantilla.component.scss'
})
export class OurPlantillaNatalyComponent implements AfterViewInit {

showInvitado = false;
  invitado: any = {};

  constructor(private route: ActivatedRoute) {

  }

  ngOnInit() {
    console.log('OurPlantillaComponent initialized');
    const invitacionId = +this.route.snapshot.queryParamMap.get('invitationId')! || 0;
    console.log('invitacionId', invitacionId);
    if (!invitacionId) {
      return
    }

    // const findInvitado = invitados.find(invitado => invitado.id === invitacionId);

    // if (findInvitado) {
    //   this.showInvitado = true;
    //   this.invitado = findInvitado
    // }



  }
  weddingDate: string = "November 14, 2026 15:00:00";
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

  @ViewChild('parallaxImg') parallaxImgRef!: ElementRef<HTMLImageElement>;
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
    if (!this.parallaxImgRef) return;
    const container = this.parallaxImgRef.nativeElement.parentElement!;
    const rect = container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    if (rect.bottom < 0 || rect.top > windowHeight) return;
    const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
    const offset = (progress - 0.5) * 100;
    this.parallaxImgRef.nativeElement.style.transform = `translateY(${offset}px)`;
  }
}

