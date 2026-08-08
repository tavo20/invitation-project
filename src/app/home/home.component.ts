import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MainService } from '../shared/services/main.service';
import { FlowPlantillaComponent } from '../plantillas/flow-plantilla/flow-plantilla.component';
import { OurPlantillaComponent } from '../plantillas/our-plantilla/our-plantilla.component';
import { BlankPlantillaComponent } from '../plantillas/blank-plantilla/blank-plantilla.component';
import { OurPlantillaNatalyComponent } from '../plantillas/our-plantilla copy/our-plantilla.component';
import { GustavoGisselComponent } from '../plantillas/gustavo-gissel/gustavo-gissel.component';
import { XvCarmesiComponent } from '../plantillas/xv-carmesi/xv-carmesi.component';
import { XvDeluxeBlackComponent } from '../plantillas/xv-deluxe-black/xv-deluxe-black.component';
import { ShowcaseComponent } from '../showcase/showcase.component';
import { LauraJuanComponent } from '../plantillas/laura-juan/laura-juan.component';
import { NeblinaComponent } from '../plantillas/neblina/neblina.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FlowPlantillaComponent, OurPlantillaComponent, BlankPlantillaComponent, ShowcaseComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [MainService]
})
export class HomeComponent {


  public templateAvailable: string = '';  public templatesAvailable: any = {
    "xyz": FlowPlantillaComponent,
    "our": OurPlantillaComponent,
    "ana-pedro": OurPlantillaComponent,
    "red": BlankPlantillaComponent,
    "g-n": OurPlantillaNatalyComponent,
    "gerson-nataly": OurPlantillaNatalyComponent,
    "g-g": GustavoGisselComponent,
    "xv-carmesi": XvCarmesiComponent,
    "xv-deluxe-black": XvDeluxeBlackComponent,
    "laura-juan": LauraJuanComponent,
    "laura-juan-2": XvDeluxeBlackComponent,
    "neblina": NeblinaComponent,
  }
  public templateComponent: any = null;

  public dataInvitation: any = null;

  public noDataFound: boolean = false;
  public showShowcase: boolean = false;
  constructor(private route: ActivatedRoute, private router: Router, private mainService: MainService) {
  }



  ngOnInit() {
    const slugInvitation = this.route.snapshot.paramMap.get('slug') || this.getQueryParam('n');
    console.log('slugInvitation', slugInvitation);
    if (!slugInvitation) {
      this.showShowcase = true;
      return;
    }
    const data = this.mainService.getDataBySlug({ slug: slugInvitation });
    console.log('data', data);
    if (data) {
      this.templateComponent = data.template;
      this.dataInvitation = data;
    } else {
      this.noDataFound = true;
    }
  }



  getQueryParams(): Record<string, string> {
    const params: Record<string, string> = {};
    this.route.snapshot.queryParamMap.keys.forEach((key) => {
      const value = this.route.snapshot.queryParamMap.get(key);
      if (value != null) params[key] = value;
    });
    return params;
  }

  getQueryParam(name: string): string | null {
    return this.route.snapshot.queryParamMap.get(name);
  }


}
