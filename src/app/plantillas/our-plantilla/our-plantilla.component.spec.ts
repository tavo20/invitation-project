import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurPlantillaComponent } from './our-plantilla.component';

describe('OurPlantillaComponent', () => {
  let component: OurPlantillaComponent;
  let fixture: ComponentFixture<OurPlantillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OurPlantillaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OurPlantillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
