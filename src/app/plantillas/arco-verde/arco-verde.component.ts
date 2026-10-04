import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicPlayerComponent } from '../../shared/components/music-player/music-player.component';

interface ArcoVerdeData {
  names1: string;
  names2: string;
  saveTheDateLabel: string;
  dateShort: string;
  heroImage: string;
  heroImagePosition?: string;
  // música
  audioSrc?: string;
  autoPlayMusic?: boolean;
  // panel verde
  inviteText: string;
  month: string;
  dayNumber: string;
  year: string;
  time: string;
  welcomeText: string;
  signature?: string;
  ceremonyTitle: string;
  ceremonyTime: string;
  ceremonyPlace: string;
  ceremonyAddress: string;
  ceremonyMapLink?: string;
  receptionTitle: string;
  receptionTime: string;
  receptionPlace: string;
  receptionAddress: string;
  receptionMapLink?: string;
  mapButtonText: string;
  // segunda foto
  secondImage: string;
  secondImagePosition?: string;
  // dress code
  dressTitle: string;
  dressText: string;
  womenLabel: string;
  womenColors: string[];
  menLabel: string;
  menColors: string[];
  // rsvp
  rsvpTitle: string;
  rsvpSubtitle: string;
  rsvpText: string;
  rsvpButtonText: string;
  confirmLink?: string;
  // itinerario
  itineraryTitle: string;
  itinerarySubtitle: string;
  itinerary: ItineraryItem[];
  // tercera foto + cuenta regresiva
  thirdImage: string;
  thirdImagePosition?: string;
  weddingDate: string;
  // contactos
  contactTitle: string;
  contactText: string;
  closingText: string;
}

type ItineraryIcon = 'rings' | 'toast' | 'couple' | 'dinner' | 'dance' | 'cake' | 'party';

interface ItineraryItem {
  time: string;
  title: string;
  icon: ItineraryIcon;
}

interface CountdownUnit {
  label: string;
  digits: string[];
}

@Component({
  selector: 'app-arco-verde',
  standalone: true,
  imports: [CommonModule, MusicPlayerComponent],
  templateUrl: './arco-verde.component.html',
  styleUrl: './arco-verde.component.scss'
})
export class ArcoVerdeComponent implements OnInit, OnDestroy {
  @Input() invitationData: Partial<ArcoVerdeData> | null = null;
  @Input() confirmation: any = null;

  private readonly defaultData: ArcoVerdeData = {
    names1: 'Valentina',
    names2: 'Sebastián',
    saveTheDateLabel: 'Save the date',
    dateShort: '18/08',
    heroImage: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Cliente_Marca/Artur/Examples/folow_03.jpg',
    heroImagePosition: 'center 35%',
    audioSrc: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Songs/Fonseca%20-%20Prometo%20(LyricLetra).mp3',
    autoPlayMusic: true,
    inviteText: '¡Queridos amigos! Los invitamos a celebrar el día más importante de nuestras vidas: ¡nuestra boda!',
    month: 'Agosto',
    dayNumber: '18',
    year: '2027',
    time: '4:00 PM',
    welcomeText: 'Será una alegría tenerte entre nuestros invitados.',
    ceremonyTitle: 'Ceremonia',
    ceremonyTime: '4:00 PM',
    ceremonyPlace: 'Parroquia Santa Lucía',
    ceremonyAddress: 'Cra. 9 # 11-20, Chía, Cundinamarca',
    ceremonyMapLink: 'https://maps.google.com/?q=Parroquia+Santa+Lucia+Chia',
    receptionTitle: 'Recepción',
    receptionTime: '6:00 PM',
    receptionPlace: 'Hacienda Los Faroles',
    receptionAddress: 'Km 3 vía Chía – Cota, Cundinamarca',
    receptionMapLink: 'https://maps.google.com/?q=Hacienda+Los+Faroles+Chia',
    mapButtonText: 'Ver ubicación',
    secondImage: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Cliente_Marca/Artur/Examples/flow_01.jpg',
    secondImagePosition: 'center 62%',
    dressTitle: 'Dress code',
    dressText: 'Te agradeceremos si acompañas la paleta de colores de nuestra celebración',
    womenLabel: 'Mujeres: vestidos y conjuntos',
    womenColors: ['#e6dbe2', '#d7a497', '#f2e9d9', '#2e2e2e'],
    menLabel: 'Hombres: trajes',
    menColors: ['#1d1d1d', '#6c6c6c', '#29382b', '#1f3a63'],
    rsvpTitle: 'RSVP',
    rsvpSubtitle: 'Confirma tu asistencia',
    rsvpText: 'Por favor, confírmanos tu asistencia llenando el formulario en el enlace de abajo.',
    rsvpButtonText: 'Confirmar asistencia',
    confirmLink: '',
    itineraryTitle: 'Itinerario',
    itinerarySubtitle: 'Nuestro gran día',
    itinerary: [
      { time: '4:00 PM', title: 'Ceremonia', icon: 'rings' },
      { time: '5:30 PM', title: 'Cóctel de bienvenida', icon: 'toast' },
      { time: '6:30 PM', title: 'Entrada de los novios', icon: 'couple' },
      { time: '7:30 PM', title: 'Cena', icon: 'dinner' },
      { time: '8:30 PM', title: 'Primer baile', icon: 'dance' },
      { time: '9:00 PM', title: 'Pastel', icon: 'cake' },
      { time: '9:30 PM', title: '¡A celebrar!', icon: 'party' }
    ],
    thirdImage: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Cliente_Marca/Artur/Examples/flow_04.jpg',
    thirdImagePosition: 'center 45%',
    weddingDate: 'August 18, 2027 16:00:00',
    contactTitle: 'Te esperamos',
    contactText: 'Bajo un mismo cielo escribimos nuestra historia, y esta noche queremos compartir contigo el comienzo del capítulo más hermoso.',
    closingText: '¡Con mucha ilusión te esperamos en nuestra boda!'
  };

  countdown: CountdownUnit[] = this.buildCountdown(0);
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private tick(): void {
    const target = new Date(this.data.weddingDate).getTime();
    const remaining = Number.isNaN(target) ? 0 : Math.max(0, target - Date.now());
    this.countdown = this.buildCountdown(remaining);
  }

  private buildCountdown(ms: number): CountdownUnit[] {
    const totalSeconds = Math.floor(ms / 1000);
    const units: [string, number][] = [
      ['días', Math.floor(totalSeconds / 86400)],
      ['horas', Math.floor((totalSeconds % 86400) / 3600)],
      ['minutos', Math.floor((totalSeconds % 3600) / 60)],
      ['segundos', totalSeconds % 60]
    ];
    return units.map(([label, value]) => ({ label, digits: String(value).padStart(2, '0').split('') }));
  }

  get data(): ArcoVerdeData {
    return { ...this.defaultData, ...(this.invitationData ?? {}) };
  }

  get signature(): string {
    return this.data.signature || `${this.data.names1} y ${this.data.names2}`;
  }
}
