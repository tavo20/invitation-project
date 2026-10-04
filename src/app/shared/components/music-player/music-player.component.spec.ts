import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicPlayerComponent } from './music-player.component';

describe('MusicPlayerComponent', () => {
  let component: MusicPlayerComponent;
  let fixture: ComponentFixture<MusicPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicPlayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render a button without a song', () => {
    expect(fixture.nativeElement.querySelector('.music-player')).toBeNull();
  });

  it('should render the button when a song is set', () => {
    fixture.componentRef.setInput('src', 'song.mp3');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.music-player')).not.toBeNull();
  });
});
