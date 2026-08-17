import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

type PaletteName = 'burgundy' | 'navy' | 'forest' | 'slate';

interface InvitationPalette {
  color: string;
  sombra: string;
  luz: string;
  sombraProfunda: string;
  paper: string;
  text: string;
}

interface SobreAmanecerData {
  names1: string;
  names2: string;
  date: string;
  palette: PaletteName;
}

@Component({
  selector: 'app-sobre-amanecer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sobre-amanecer.component.html',
  styleUrl: './sobre-amanecer.component.scss'
})
export class SobreAmanecerComponent implements OnInit, OnChanges {
  @Input() invitationData: Partial<SobreAmanecerData> | null = null;

  selectedPalette: PaletteName = 'burgundy';

  readonly palettes: Record<PaletteName, InvitationPalette> = {
    burgundy: {
      color: '#633642',
      sombra: '#44222b',
      luz: '#733f4d',
      sombraProfunda: '#562c37',
      paper: '#f6f1ea',
      text: '#ffffff'
    },
    navy: {
      color: '#24344d',
      sombra: '#141e30',
      luz: '#314463',
      sombraProfunda: '#182436',
      paper: '#f4f2ee',
      text: '#ffffff'
    },
    forest: {
      color: '#2f4d3b',
      sombra: '#1c3024',
      luz: '#3e634d',
      sombraProfunda: '#233a2c',
      paper: '#f4f3ec',
      text: '#ffffff'
    },
    slate: {
      color: '#434850',
      sombra: '#2b2f34',
      luz: '#575d66',
      sombraProfunda: '#363a40',
      paper: '#f3f2ef',
      text: '#ffffff'
    }
  };

  readonly paletteOptions: { key: PaletteName; label: string }[] = [
    { key: 'burgundy', label: 'Borgoña' },
    { key: 'navy', label: 'Navy' },
    { key: 'forest', label: 'Bosque' },
    { key: 'slate', label: 'Gris' }
  ];

  private readonly defaultData: SobreAmanecerData = {
    names1: 'Marcos',
    names2: 'Mariana',
    date: '06.12.2025',
    palette: 'burgundy'
  };

  get data(): SobreAmanecerData {
    return { ...this.defaultData, ...(this.invitationData ?? {}) };
  }

  get colors(): InvitationPalette {
    return this.palettes[this.selectedPalette] ?? this.palettes.burgundy;
  }

  get paletteVars(): Record<string, string> {
    const colors = this.colors;
    return {
      '--sobre-color': colors.color,
      '--sobre-sombra': colors.sombra,
      '--sobre-luz': colors.luz,
      '--sobre-sombra-profunda': colors.sombraProfunda,
      '--paper': colors.paper,
      '--texto-color': colors.text
    };
  }

  ngOnInit(): void {
    this.applyIncomingPalette();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invitationData']) {
      this.applyIncomingPalette();
    }
  }

  setPalette(palette: PaletteName): void {
    this.selectedPalette = palette;
  }

  private applyIncomingPalette(): void {
    const incoming = this.data.palette;
    if (incoming && this.palettes[incoming]) {
      this.selectedPalette = incoming;
    }
  }
}
