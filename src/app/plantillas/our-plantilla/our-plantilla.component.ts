import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import { invitados } from '../../assets/data/invitados'
import { CommonModule } from '@angular/common';
import { CountDownComponent } from '../../shared/components/count-down/count-down.component';
import { EventComponent } from '../../shared/components/event/event.component';

@Component({
  selector: 'app-our-plantilla',
  standalone: true,
  imports: [CountDownComponent, EventComponent, CommonModule],
  templateUrl: './our-plantilla.component.html',
  styleUrl: './our-plantilla.component.scss'
})
export class OurPlantillaComponent {

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
    debugger

    // if (findInvitado) {
    //   this.showInvitado = true;
    //   this.invitado = findInvitado
    // }



  }
  weddingDate: string = "August 9, 2025 10:00:00";
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
}

