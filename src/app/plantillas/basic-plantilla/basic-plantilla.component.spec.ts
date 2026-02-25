import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicPlantillaComponent } from './basic-plantilla.component';

describe('BasicPlantillaComponent', () => {
  let component: BasicPlantillaComponent;
  let fixture: ComponentFixture<BasicPlantillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicPlantillaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicPlantillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
