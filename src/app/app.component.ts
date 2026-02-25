import { Component } from '@angular/core';
import { VibrantPlantillaComponent } from './plantillas/vibrant-plantilla/vibrant-plantilla.component';
import { BasicPlantillaComponent } from './plantillas/basic-plantilla/basic-plantilla.component';
import { ModernPlantillaComponent } from './plantillas/modern-plantilla/modern-plantilla.component';
import { WarmPlantillaComponent } from './plantillas/warm-plantilla/warm-plantilla.component';
import { OurPlantillaComponent } from './plantillas/our-plantilla/our-plantilla.component';
import { FlowPlantillaComponent } from './plantillas/flow-plantilla/flow-plantilla.component';
import { ActivatedRoute, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [VibrantPlantillaComponent, BasicPlantillaComponent, ModernPlantillaComponent, WarmPlantillaComponent, OurPlantillaComponent, FlowPlantillaComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'invitation-project';

  public respon = {};




  constructor(private route: ActivatedRoute) {

  }


  public x= "hola";


  ngOnInit() {
    this.getURLPath();
    this.getData();
  }

  public getURLPath() {
    const segment = this.route.snapshot;
    console.log('url', segment);
  }


  getData() {
    try {
      this.respon = {
        id: "xyz",
        data: {
          fecha: "20 de Mayo"
        }
      }
    } catch (error) {
      console.error('error getting data - template', error)
    }
  }

}
