import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VibrantPlantillaComponent } from './vibrant-plantilla.component';

describe('VibrantPlantillaComponent', () => {
  let component: VibrantPlantillaComponent;
  let fixture: ComponentFixture<VibrantPlantillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VibrantPlantillaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VibrantPlantillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
