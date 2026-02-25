import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModernPlantillaComponent } from './modern-plantilla.component';

describe('ModernPlantillaComponent', () => {
  let component: ModernPlantillaComponent;
  let fixture: ComponentFixture<ModernPlantillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModernPlantillaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModernPlantillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
