import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MainService } from '../shared/services/main.service';
import { FlowPlantillaComponent } from '../plantillas/flow-plantilla/flow-plantilla.component';
import { OurPlantillaComponent } from '../plantillas/our-plantilla/our-plantilla.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FlowPlantillaComponent, OurPlantillaComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [MainService]
})
export class HomeComponent {


  public templateAvailable: string = '';  public templatesAvailable: any = {
    "xyz": FlowPlantillaComponent,
    "our": OurPlantillaComponent,
  }
  public templateComponent: any = null;

  public dataInvitation: any = null;

  public noDataFound: boolean = false;
  constructor(private route: ActivatedRoute, private router: Router, private mainService: MainService) {
    console.log('query param', this.getQueryParam('n'));
  }



  ngOnInit() {
    const nameInvitation = this.getQueryParam('n') ?? '';
    const data = this.mainService.getDataByName({name: nameInvitation});
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
