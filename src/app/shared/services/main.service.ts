import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, map, type Observable } from 'rxjs';
import type {
  ConfirmationApiSuccess,
  ConfirmationInviteContext
} from './confirmation.service';


@Injectable({
  providedIn: 'root'
})
export class MainService {
  private readonly BACKEND_URL = environment.apiUrl;
  private readonly PATH = 'api/invitation-template';

  public template_fijos: any = [
    {
      id: "gus-gi-78kft2y3",
      slug: "gus-gi",
      data: {
        names1: 'Mariana',
        names2: 'Javier',
        invitationText1: 'ES UN HONOR INVITARTE A LA CELEBRACIÓN',
        invitationText2: 'DE NUESTRA BODA',
        dayOfWeek: 'SÁBADO',
        month: 'NOV',
        dayNumber: '26',
        year: '2030',
        hourLabel: '20:00 HRS.',
        weddingDate: 'November 26, 2030 20:00:00',
        musicImage: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Banco_Fotos/flow_02.jpg',
        songTitle: 'Perfect',
        songArtist: 'Ed Sheeran',
        audioSrc: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Songs/Ed%20Sheeran%20-%20Perfect.mp3',
        parentsTitle: 'Con la bendición de nuestros padres',
        brideLabel: 'Novia',
        brideParents: ['Laura Mendoza', 'Carlos Mendoza'],
        groomLabel: 'Novio',
        groomParents: ['Marta Ríos', 'Jorge Ríos'],
        padrinosLabel: 'Padrinos',
        padrinos: ['Ana Salazar', 'Pedro Castillo'],
        countdownTitle: 'Faltan pocos días',
        countdownText: 'Acompáñanos a contar los días para celebrar este momento tan especial.',
        image2: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Banco_Fotos/flow_01.jpg',
        eventTitle: 'Ceremonia y Recepción',
        eventVenue: 'Hacienda Los Faroles',
        eventAddress: 'Chía, Cundinamarca',
        eventHour: '3:00 PM',
        eventMapLink: '#',
        eventButtonText: 'Ver ubicación',
        dressTitle: 'Dress Code',
        dressType: 'Semi Formal',
        dressColors: ['#2c4a2e', '#8e9d70', '#d4c4a8', '#f3efe8'],
        dressNote: 'Por favor, evita vestir de color verde claro, está reservado para la novia.',
        quoteImage: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Banco_Fotos/flow_01.jpg',
        quote: 'Bajo un mismo cielo escribimos nuestra historia, y esta noche queremos compartir contigo el comienzo del capítulo más hermoso.',
        itineraryTitle: 'Itinerario',
        itinerary: [
          { time: '4:00 PM', label: 'Ceremonia' },
          { time: '5:30 PM', label: 'Cóctel de bienvenida' },
          { time: '7:00 PM', label: 'Recepción' },
          { time: '9:00 PM', label: 'Fiesta' }
        ],
        confirmTitle: 'Confirma tu asistencia',
        confirmText: 'Tu respuesta nos ayudará a organizar este día con mucho cariño.',
        confirmButtonText: 'Confirmar aquí',
        // confirmLink: 'http://localhost:4200//invitation/confirmation/gus-gi-78kft2y3',
        confirmLink: 'https://www.invitapp.art/invitation/confirmation/gus-gi-78kft2y3',
        sobresTitle: 'Lluvia de sobres',
        closingHighlight: 'Tenemos la luna, la música y cada detalle preparado… <br> Solo falta lo más importante: tú.',
        closingNames: 'Mariana & Javier',
        typeConfirmation: 'basic',
        linkInvitation: "https://www.invitapp.art/gus-gi",
        linkListInvitation: "https://www.invitapp.art/invitation/confirmations/list/gus-gi-78kft2y3",
      },
      template: "xyz",
      active: true
    },

    
    {
      id: 2,
      slug: "our",
      data: {
        heroImage: "assets/images/main-photo.png",
        heroNames1: "Gustavo",
        heroNames2: "Gissel",
        curveText: "GUSTAVO&GISSEL",
        dayOfWeek: "MIÉRCOLES",
        dayNumber: "12",
        year: "2026",
        month: "A G O",
        audioSrc: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Songs/Fonseca%20-%20Que%20Suerte%20Tenerte%20(Audio).mp3",
        guestMessage: "Bienvenid@s a nuestra Boda.",
        guestName: "",
        quote: "El amor es paciente, es bondadoso. No se enoja fácilmente, todo lo soporta.",
        quoteReference: "1 Corintios 13:4-5",
        weddingDate: "August 9, 2027 10:00:00",
        eventTitle: "Ceremonia y Recepción",
        eventVenue: "HACIENDA LOS FAROLES",
        eventAddress: "San Rafael, Huila",
        eventHour: "3:00 PM",
        eventMapLink: "https://maps.app.goo.gl/UP6C67Tya92kXPRX7?g_st=iwb",
        dressWomenNote: "Ellas Divinas (Se reserva el color verde oliva)",
        dressMenNote: "Ellos Guapos",
        dressWomenImage: "assets/images/w-dress.png",
        dressWomenShoesImage: "assets/images/w-shoes.png",
        dressMenImage: "assets/images/m-shoes.png",
        dressMenShoesImage: "assets/images/m-shoes.png",
        confirmMessage: "Hemos pensado en ti porque has sido importante en nuestras vidas, queremos contar contigo.",
        confirmLink: "https://forms.gle/rZkQ7R6z6bAi4o3fA",
        sobresText: "Lluvia de sobres.",
        closingImage: "assets/images/main-photo.png"
      },
      template: "our",
      active: true
    },
    {
      id: 10,
      slug: "gerson-nataly",
      data: {},
      template: "gerson-nataly",
      active: true
    },
    {
      id: 7,
      slug: "gabriel-andrea",
      data: {
        heroImage: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/sign/invitation/portada.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NjY1YjI5My1jMDQyLTQ5MGEtODM2Zi1kODI4ZmQ5NTM2NTAiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbnZpdGF0aW9uL3BvcnRhZGEuanBnIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NTg0NDAxNywiZXhwIjoxOTExOTg4MDE3fQ.WRwYO0zdyZMdz_0cadcPnxBbuIUgQzKxNO8D08cbzfI",
        heroPretitle: "Gabriel & Andrea",
        heroTitle: "NOS CASAMOS",
        heroMessage: "Dos historias se encontraron y hoy celebramos el inicio de un camino lleno de amor, ilusión y nuevos recuerdos.",
        weddingDate: "December 12, 2026 17:30:00",
        dayOfWeek: "SÁBADO",
        dayNumber: "12",
        year: "2026",
        month: "D I C",
        parallaxImage1: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/sign/invitation/basic_01.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NjY1YjI5My1jMDQyLTQ5MGEtODM2Zi1kODI4ZmQ5NTM2NTAiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbnZpdGF0aW9uL2Jhc2ljXzAxLmpwZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODU4NDM5NzcsImV4cCI6MTkxMTk4Nzk3N30.FRvoa8RKV6Rk1vApDOajYBlcUix9emsw6JFyZ2eGMj4',
        parallaxImage2: 'https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/sign/invitation/basic_02.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NjY1YjI5My1jMDQyLTQ5MGEtODM2Zi1kODI4ZmQ5NTM2NTAiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbnZpdGF0aW9uL2Jhc2ljXzAyLmpwZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODU4NDQwMzMsImV4cCI6MTkxMTk4ODAzM30.Sjj25V4V1gLnv4-9h0BUtOXewcyO1w1s_q01sFDjsZE',
      },
      template: "g-g",
      active: true
    },
    {
      id: 8,
      slug: "laura-juan",
      data: {
        heroImage: "assets/new-claude-our/portada.jpg",
        names1: "Laura",
        names2: "Juan",
        dateText: "18 · 07 · 2026",
        weddingDate: "December 18, 2026 16:00:00",
        eventLocation: "CAJICÁ, CUNDINAMARCA",
        heroPretitle: "Nos casamos",
        heroTitle: "NOS CASAMOS",
        heroMessage: "Bajo un mismo cielo escribimos nuestra historia, y esta noche queremos compartir contigo el comienzo del capítulo más hermoso.",
        quote: "Nuestro amor estaba escrito en las estrellas.<br>Y hoy el cielo entero celebra con nosotros.",
        quoteReference: "",
        parallaxImage1: "assets/new-claude-our/basic_01.jpg",
        parallaxImage2: "assets/new-claude-our/basic_02.jpg",
        eventTitle: "Ceremonia y Recepción",
        eventMapLink: "https://maps.app.goo.gl/UP6C67Tya92kXPRX7?g_st=iwb",
        timeline: [
          { time: "4:00 PM", desc: "Ceremonia" },
          { time: "5:30 PM", desc: "Cóctel de bienvenida" },
          { time: "7:00 PM", desc: "Recepción" },
          { time: "9:00 PM", desc: "Fiesta" }
        ],
        eventButtonText: "VER UBICACIÓN",
        dressType: "Formal Nocturno",
        dressWomenDesc: "Vestido largo o cóctel.",
        dressMenDesc: "Traje oscuro.",
        dressNote: "El color blanco está reservado para la novia.",
        confirmTitle: "Confirma tu Asistencia",
        confirmMessage: "Hemos pensado en ti porque eres parte de nuestra historia. Queremos contar contigo esa noche.",
        confirmButtonText: "CONFIRMA AQUÍ",
        confirmLink: "https://www.google.com/?hl=es",
        sobresTitle: "Lluvia de Sobres",
        sobresMessage: "Si deseas tener un detalle con nosotros, lo recibimos con mucho cariño.",
        finalHighlight: "Nos vemos bajo las estrellas",
        finalText1: "Tenemos la luna, la música y cada detalle preparado…",
        finalText2: "Solo falta lo más importante: tú.",
        closingFinal: "Laura & Juan",
        audioSrc: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Songs/Fonseca%20-%20Prometo%20(LyricLetra).mp3"
      },
      template: "laura-juan",
      active: true
    },
    {
      id: 13,
      slug: "azul-gris-colores",
      data: {
        palette: "navy"
      },
      template: "azul-gris-colores",
      active: true
    },
    {
      id: 12,
      slug: "neblina",
      data: {
        inicial_1: "L",
        inicial_2: "S",
        heroImage: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/portada_2_neblina.jpeg",
        monogram: "LS",
        names1: "Lucía",
        names2: "Santiago",
        date: "14 · 02 · 2027",
        location: "Bogotá, Colombia",
        quote: "El amor nos unió para siempre y queremos compartir este gran día contigo."

      },
      template: "neblina",
      active: true
    },
    {
      id: 14,
      slug: "sobre-amanecer",
      data: {
        names1: "Marcos",
        names2: "Mariana",
        date: "06.12.2025",
        palette: "burgundy",
        inicial1: "M",
        inicial2: "M",
        announceTitle: "¡NOS CASAMOS!",
        announceMessage: "No lo creían, pero nuestro día llegó.",
        heroImage: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/nicol-andres-03-10-26/segunda_resize.jpg",
        musicLabel: "Dale play a nuestra canción",
        audioSrc: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Songs/Fonseca%20-%20Prometo%20(LyricLetra).mp3",
        storyText: "Nuestra historia continúa... por ello, con el amor que nos une, la bendición de Dios y el apoyo de nuestros padres, uniremos nuestras vidas y queremos que seas parte de este nuevo capítulo.",
        month: "ENERO",
        dayOfWeek: "SÁBADO",
        dayNumber: "24",
        year: "2027",
        weddingDate: "January 24, 2027 16:00:00",
        eventsImage: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/portada_neblina.jpeg",
        ceremonyTime: "4:30 pm",
        ceremonyTitle: "CEREMONIA CIVIL",
        ceremonyPlace: "IGLESIA MACARENA",
        ceremonyArea: "Miraflores",
        ceremonyMapLink: "#",
        receptionTime: "6:30 pm",
        receptionTitle: "RECEPCIÓN",
        receptionPlace: "CONDOMINIO URUBÓ",
        receptionArea: "Miraflores",
        receptionMapLink: "#",
        eventButtonLabel: "Ver ubicación",
        itineraryTitle: "ITINERARIO DE ACTIVIDADES",
        itinerary: [
          { time: "6:30", label: "CEREMONIA CIVIL", icon: "rings" },
          { time: "6:50", label: "CÓCTEL DE BIENVENIDA", icon: "cheers" },
          { time: "7:30", label: "INGRESO DE LOS ESPOSOS", icon: "arch" },
          { time: "7:35", label: "PRIMER BAILE Y BRINDIS", icon: "dance" },
          { time: "8:30", label: "CENA", icon: "dinner" },
          { time: "10:00", label: "FIESTA", icon: "party" },
          { time: "3:00 a.m.", label: "FIN", icon: "clock" }
        ],
        confirmTitle: "CONFIRMAR ASISTENCIA",
        confirmText: "Agradecemos que confirmes tu asistencia antes del 27 de diciembre",
        confirmButtonText: "Confirmar aquí",
        confirmLink: "#",
        dressTitle: "CÓDIGO DE VESTIMENTA",
        dressType: "Formal",
        dressNote: "Con mucho cariño, les pedimos evitar prendas en color blanco y tonos similares.",
        dressImage: "assets/sobre-amanecer/dress-code.svg",
        giftTitle: "LLUVIA DE SOBRES",
        closingImage: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/carru_2.jpeg",
        noKidsTitle: "SIN NIÑOS",
        noKidsText: "Un evento para adultos está en camino. ¡Así que prepárense para una noche llena de diversión! Dejemos a los niños en casa esta vez.",
        presenceText: "ESPERAMOS CONTAR CON SU PRESENCIA",
        thanksText: "Muchas Gracias!",
      },
      template: "sobre-amanecer",
      active: true
    }
  ]

  public data: any = [
    {
      id: 4,
      slug: "g-n",
      data: {},
      template: "g-n",
      active: true
    },
    {
      id: 5,
      slug: "xv-carmesi",
      data: {},
      template: "xv-carmesi",
      active: true
    },
    {
      id: 6,
      slug: "xv-deluxe-black",
      data: {},
      template: "xv-deluxe-black",
      active: true
    },

    {
      id: 10,
      slug: "ana-pedro",
      data: {
        heroImage: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/sign/invitation/portada.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NjY1YjI5My1jMDQyLTQ5MGEtODM2Zi1kODI4ZmQ5NTM2NTAiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbnZpdGF0aW9uL3BvcnRhZGEuanBnIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4NTg0NDAxNywiZXhwIjoxOTExOTg4MDE3fQ.WRwYO0zdyZMdz_0cadcPnxBbuIUgQzKxNO8D08cbzfI",
        heroPretitle: "Ana & Pedro",
        heroTitle: "NOS CASAMOS",
        heroMessage: "Dos historias se encontraron y hoy celebramos el inicio de un camino lleno de amor, ilusión y nuevos recuerdos.",
        weddingDate: "December 12, 2026 17:30:00",
        dayOfWeek: "SÁBADO",
        dayNumber: "12",
        year: "2026",
        month: "D I C",
        quote: "El amor no se encuentra, se construye día a día.",
        quoteAuthor: "Ana y Pedro",
        fatherGroom: "Luis Pérez",
        motherGroom: "Marta Gómez",
        fatherBride: "Carlos Rojas",
        motherBride: "Lucía Herrera",
        eventTitle: "Ceremonia y Recepción",
        eventVenue: "Hacienda El Roble",
        eventAddress: "Km 8 Vía Cajicá, Cundinamarca",
        eventHour: "4:30 PM",
        dressWomen: "Vestido largo o cóctel en tonos neutros.",
        dressMen: "Traje oscuro o azul marino.",
        dressNote: "El blanco queda reservado para la novia.",
        confirmMessage: "Nos encantará contar contigo en nuestro gran día.",
        sobresMessage: "Si deseas tener un detalle con nosotros, lo recibimos con mucho cariño.",
        closingHighlight: "Nos vemos para celebrar el amor!",
        closingText1: "Todo está listo para una noche inolvidable...",
        closingText2: "Solo falta tu presencia para hacerlo perfecto: <br>compártelo con nosotros.",
        closingFinal: "Con cariño, <br>Ana & Pedro!",
        parallaxImage1: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/sign/invitation/basic_01.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NjY1YjI5My1jMDQyLTQ5MGEtODM2Zi1kODI4ZmQ5NTM2NTAiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbnZpdGF0aW9uL2Jhc2ljXzAxLmpwZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODU4NDM5NzcsImV4cCI6MTkxMTk4Nzk3N30.FRvoa8RKV6Rk1vApDOajYBlcUix9emsw6JFyZ2eGMj4",
        parallaxImage2: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/sign/invitation/basic_02.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NjY1YjI5My1jMDQyLTQ5MGEtODM2Zi1kODI4ZmQ5NTM2NTAiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbnZpdGF0aW9uL2Jhc2ljXzAyLmpwZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODU4NDQwMzMsImV4cCI6MTkxMTk4ODAzM30.Sjj25V4V1gLnv4-9h0BUtOXewcyO1w1s_q01sFDjsZE"
      },
      template: "g-g",
      active: true
    },
    {
      id: 10,
      slug: "maria-jose-gustavo",
      data: {
        heroPretitle: "Maria & Gustavo",
        heroTitle: "NOS CASAMOS",
        heroMessage: "Dos historias se encontraron y hoy celebramos el inicio de un camino lleno de amor, ilusión y nuevos recuerdos.",
        weddingDate: "August 8, 2027 17:00:00",
        dayOfWeek: "SÁBADO",
        dayNumber: "9",
        year: "2027",
        month: "A G O",
        quote: "El amor no se encuentra, se construye día a día. ¡Nos casamos!",
        quoteAuthor: "Maria y Gustavo",
        eventTitle: "Ceremonia y Recepción",
        eventVenue: "Hacienda El Roble",
        eventAddress: "Km 8 Vía Cajicá, Cundinamarca",
        eventHour: "4:30 PM",
        dressWomen: "Vestido largo o cóctel en tonos neutros.",
        dressMen: "Traje oscuro o azul marino.",
        dressNote: "El blanco queda reservado para la novia.",
        confirmMessage: "Nos encantará contar contigo en nuestro gran día.",
        sobresMessage: "Si deseas tener un detalle con nosotros, lo recibimos con mucho cariño.",
        closingHighlight: "Nos vemos para celebrar el amor!",
        closingText1: "Todo está listo para una noche inolvidable...",
        closingText2: "Solo falta tu presencia para hacerlo perfecto: <br>compártelo con nosotros.",
        closingFinal: "Con cariño, <br>Ana & Pedro!"
      },
      template: "g-g",
      active: true
    },

    {
      id: 9,
      slug: "laura-juan-2",
      data: {},
      template: "laura-juan-2",
      active: true
    },
    {
      id: 2,
      slug: "pedro-ana",
      data: {

        heroImage: "assets/images/main-photo.png",
        heroNames1: "Ana",
        heroNames2: "Pedro",
        curveText: "ANA&PEDRO",
        dayOfWeek: "SÁBADO",
        dayNumber: "12",
        year: "2026",
        month: "D I C",
        audioSrc: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Songs/Fonseca%20-%20Que%20Suerte%20Tenerte%20(Audio).mp3",
        guestMessage: "Bienvenid@s a nuestra Boda.",
        guestName: "",
        quote: "El amor no se encuentra, se construye día a día. ¡Nos casamos!",
        quoteReference: "",
        weddingDate: "December 12, 2026 17:30:00",
        eventTitle: "Ceremonia y Recepción",
        eventVenue: "HACIENDA LOS FAROLES",
        eventAddress: "San Rafael, Cundinamarca",
        eventHour: "3:00 PM",
        eventMapLink: "https://www.google.com/maps/place/Cl.+7+%23+29-11,+Melgar,+Tolima/@4.2011456,-74.6449439,19z/data=!4m6!3m5!1s0x8e3edefe1b60b2cb:0xdcde444d1f284f5b!8m2!3d4.201225!4d-74.6450334!16s%2Fg%2F11x2m3jrxl?entry=tts&g_ep=EgoyMDI2MDgxMi4wIPu8ASoASAFQAw%3D%3D&skid=2f63d9fc-62ac-4831-9442-1dc7dd21cdc2",
        dressWomenNote: "Ellas Divinas (Se reserva el color verde oliva)",
        dressMenNote: "Ellos Guapos",
        dressWomenImage: "assets/images/w-dress.png",
        dressWomenShoesImage: "assets/images/w-shoes.png",
        dressMenImage: "assets/images/m-shoes.png",
        dressMenShoesImage: "assets/images/m-shoes.png",
        confirmMessage: "Hemos pensado en ti porque has sido importante en nuestras vidas, queremos contar contigo.",
        confirmLink: "https://forms.gle/rZkQ7R6z6bAi4o3fA",
        sobresText: "Lluvia de sobres.",
        closingImage: "assets/images/main-photo.png"
      },
      template: "our",
      active: true
    },
  ];

  public platillas_vendidas: any = [
    // {

    //   id: "nicol-andres-f56ejnslo",
    //   slug: "nicol-andres",
    //   data: {
    //     nombreCliente: "Artur",
    //     instragramCliente: "https://www.instagram.com/artur_visualss/",
    //     names1: "Nicol",
    //     names2: "Andrés",
    //     dateText: "03 · 10 · 2026",
    //     heroPretitle: "Nos casamos",
    //     heroTitle: "NOS CASAMOS",
    //     heroMessage: "Bajo un mismo cielo escribimos nuestra historia, y esta noche queremos compartir contigo el comienzo del capítulo más hermoso.",
    //     quote: "No sé de qué están hechas las almas, pero la tuya y la mía son una sola",
    //     weddingDate: "Octubre 3, 2026 18:00:00",
    //     eventLocation: "Melgar Tolima",
    //     quoteReference: "",
    //     // parallaxImage1: "assets/new-claude-our/basic_01.jpg",
    //     eventTitle: "Ceremonia y Recepción",
    //     timeline: [
    //       { time: "6:00 PM", desc: 'Ceremonia', spam: 'Parroquia B/Sicomoro' },
    //       { time: "7:00 PM", desc: "Recepción (Mapa)" },
    //       // { time: "7:00 PM", desc: "Recepción" },
    //       // { time: "9:00 PM", desc: "Fiesta" }
    //     ],
    //     eventButtonText: "VER UBICACIÓN",
    //     dressType: "Formal Nocturno",
    //     dressWomenDesc: "Ellas Vestido Largo o Coctel",
    //     dressMenDesc: "Traje",
    //     dressNote: "Color Blanco Reservado para Novia, Azul Oscuro reservado para el Novio",
    //     confirmTitle: "Confirma tu Asistencia",
    //     confirmMessage: "Hemos pensado en ti porque eres parte de nuestra historia. Queremos contar contigo esa noche.",
    //     confirmButtonText: "CONFIRMA AQUÍ",
    //     confirmLink: "https://www.invitapp.art/invitation/confirmation/nicol-andres-f56ejnslo",
    //     linkInvitation: "https://www.invitapp.art/nicol-andres",
    //     linkListInvitation: "https://www.invitapp.art/invitation/confirmations/list/nicol-andres-f56ejnslo",
    //     // confirmLink: "http://localhost:4200/invitation/confirmation/nicol-andres-f56ejnslo",
    //     sobresTitle: "Lluvia de Sobres",
    //     sobresMessage: "",
    //     finalHighlight: "Nos vemos bajo las estrellas",
    //     finalText1: "Tenemos la luna, la música y cada detalle preparado…",
    //     finalText2: "Solo falta lo más importante: tú.",
    //     closingFinal: "Nicol & Andrés",
    //     heroImage: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/nicol-andres-03-10-26/primera_opt.jpg",
    //     parallaxImage1: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/nicol-andres-03-10-26/segunda_resize.jpg",
    //     parallaxImage2: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/nicol-andres-03-10-26/tercera_resize.jpg",
    //     eventMapLink: "https://www.google.com/maps/place/Cl.+7+%23+29-11,+Melgar,+Tolima/@4.2011456,-74.6449439,19z/data=!4m6!3m5!1s0x8e3edefe1b60b2cb:0xdcde444d1f284f5b!8m2!3d4.201225!4d-74.6450334!16s%2Fg%2F11x2m3jrxl?entry=tts&g_ep=EgoyMDI2MDgxMi4wIPu8ASoASAFQAw%3D%3D&skid=2f63d9fc-62ac-4831-9442-1dc7dd21cdc2",
    //     audioSrc: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/nicol-andres-03-10-26/asi_es_nuestro_amor_cut.mp3",
    //     eventMapLabel: "La quinta amarilla"


    //   },
    //   template: "laura-juan",
    //   active: true
    // }
  ]

  public photographers_para_vender: any = [
    {

      id: "cliente_propuesta",
      slug: "propuesta_alexis",
      data: {
        nombreCliente: "Alexis",
        instragramCliente: "https://www.instagram.com/lexisphotography.co/",
        names1: "Nicol",
        names2: "Andrés",
        dateText: "03 · 10 · 2026",
        heroPretitle: "Nos casamos",
        heroTitle: "NOS CASAMOS",
        heroMessage: "Bajo un mismo cielo escribimos nuestra historia, y esta noche queremos compartir contigo el comienzo del capítulo más hermoso.",
        quote: "No sé de qué están hechas las almas, pero la tuya y la mía son una sola",
        weddingDate: "Octubre 3, 2026 18:00:00",
        eventLocation: "Melgar Tolima",
        quoteReference: "",
        // parallaxImage1: "assets/new-claude-our/basic_01.jpg",
        eventTitle: "Ceremonia y Recepción",
        timeline: [
          { time: "6:00 PM", desc: "Ceremonia" },
          { time: "7:00 PM", desc: "Recepción (Mapa)" },
          // { time: "7:00 PM", desc: "Recepción" },
          // { time: "9:00 PM", desc: "Fiesta" }
        ],
        eventButtonText: "VER UBICACIÓN",
        dressType: "Formal Nocturno",
        dressWomenDesc: "Ellas Vestido Largo o Coctel",
        dressMenDesc: "Traje",
        dressNote: "Color Blanco Reservado para Novia, Azul Oscuro reservado para el Novio",
        confirmTitle: "Confirma tu Asistencia",
        confirmMessage: "Hemos pensado en ti porque eres parte de nuestra historia. Queremos contar contigo esa noche.",
        confirmButtonText: "CONFIRMA AQUÍ",
        confirmLink: "https://www.invitapp.art/invitation/confirmation/cliente_propuesta",
        linkInvitation: "https://www.invitapp.art/alexis",
        linkListInvitation: "https://www.invitapp.art/invitation/confirmations/list/cliente_propuesta",
        linkPresentation: "https://www.invitapp.art/invitation/delivery/cliente_propuesta",
        sobresTitle: "Lluvia de Sobres",
        sobresMessage: "",
        finalHighlight: "Nos vemos bajo las estrellas",
        finalText1: "Tenemos la luna, la música y cada detalle preparado…",
        finalText2: "Solo falta lo más importante: tú.",
        closingFinal: "Nicol & Andrés",
        heroImage: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/clientes_propuestas/portada_alexis%20(1).jpg",
        parallaxImage1: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/clientes_propuestas/2_alexis%20(1).jpg",
        parallaxImage2: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/clientes_propuestas/tres_alexis%20(1).jpg",
        eventMapLink: "https://www.google.com/maps/place/Cl.+7+%23+29-11,+Melgar,+Tolima/@4.2011456,-74.6449439,19z/data=!4m6!3m5!1s0x8e3edefe1b60b2cb:0xdcde444d1f284f5b!8m2!3d4.201225!4d-74.6450334!16s%2Fg%2F11x2m3jrxl?entry=tts&g_ep=EgoyMDI2MDgxMi4wIPu8ASoASAFQAw%3D%3D&skid=2f63d9fc-62ac-4831-9442-1dc7dd21cdc2",
        audioSrc: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Songs/Ed%20Sheeran%20-%20Perfect.mp3",
        eventMapLabel: "La quinta amarilla"


      },
      template: "laura-juan",
      active: true
    },
    {

      id: "cliente_propuesta",
      slug: "propuesta_juliana",
      data: {
        nombreCliente: "Juliana",
        instragramCliente: "https://www.instagram.com/talerophoto",
        names1: "Julian",
        names2: "Pedro",
        dateText: "03 · 10 · 2026",
        heroPretitle: "Nos casamos",
        heroTitle: "NOS CASAMOS",
        heroMessage: "Bajo un mismo cielo escribimos nuestra historia, y esta noche queremos compartir contigo el comienzo del capítulo más hermoso.",
        quote: "No sé de qué están hechas las almas, pero la tuya y la mía son una sola",
        weddingDate: "Octubre 3, 2026 18:00:00",
        eventLocation: "Melgar Tolima",
        quoteReference: "",
        // parallaxImage1: "assets/new-claude-our/basic_01.jpg",
        eventTitle: "Ceremonia y Recepción",
        timeline: [
          { time: "6:00 PM", desc: "Ceremonia" },
          { time: "7:00 PM", desc: "Recepción (Mapa)" },
          // { time: "7:00 PM", desc: "Recepción" },
          // { time: "9:00 PM", desc: "Fiesta" }
        ],
        eventButtonText: "VER UBICACIÓN",
        dressType: "Formal Nocturno",
        dressWomenDesc: "Ellas Vestido Largo o Coctel",
        dressMenDesc: "Traje",
        dressNote: "Color Blanco Reservado para Novia, Azul Oscuro reservado para el Novio",
        confirmTitle: "Confirma tu Asistencia",
        confirmMessage: "Hemos pensado en ti porque eres parte de nuestra historia. Queremos contar contigo esa noche.",
        confirmButtonText: "CONFIRMA AQUÍ",
        confirmLink: "https://www.invitapp.art/invitation/confirmation/cliente_propuesta",
        linkInvitation: "https://www.invitapp.art/propuesta_juliana",
        linkListInvitation: "https://www.invitapp.art/invitation/confirmations/list/cliente_propuesta",
        linkPresentation: "https://www.invitapp.art/invitation/delivery/propuesta_juliana",
        sobresTitle: "Lluvia de Sobres",
        sobresMessage: "",
        finalHighlight: "Nos vemos bajo las estrellas",
        finalText1: "Tenemos la luna, la música y cada detalle preparado…",
        finalText2: "Solo falta lo más importante: tú.",
        closingFinal: "Juliana & Pedro",
        heroImage: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/nicol-andres-03-10-26/primera_opt.jpg",
        parallaxImage1: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/nicol-andres-03-10-26/segunda_resize.jpg",
        parallaxImage2: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/nicol-andres-03-10-26/tercera_resize.jpg",
        eventMapLink: "https://www.google.com/maps/place/Cl.+7+%23+29-11,+Melgar,+Tolima/@4.2011456,-74.6449439,19z/data=!4m6!3m5!1s0x8e3edefe1b60b2cb:0xdcde444d1f284f5b!8m2!3d4.201225!4d-74.6450334!16s%2Fg%2F11x2m3jrxl?entry=tts&g_ep=EgoyMDI2MDgxMi4wIPu8ASoASAFQAw%3D%3D&skid=2f63d9fc-62ac-4831-9442-1dc7dd21cdc2",
        audioSrc: "https://iapmyqlwifdhvuksabgt.supabase.co/storage/v1/object/public/invitation/Songs/Ed%20Sheeran%20-%20Perfect.mp3",
        eventMapLabel: "La quinta amarilla"


      },
      template: "laura-juan",
      active: true
    },
  ]
  constructor(private http: HttpClient) { }

  public getData() {
    return this.data;
  }

  public async getDataBySlug({ slug }: { slug: string }) {
    // const invitations: ConfirmationInviteContext[] = await lastValueFrom(this.getInvitationsAvailable());
    const invitation: ConfirmationInviteContext = await lastValueFrom(this.getInvitationBySlug(slug));
    return [...this.data, ...this.template_fijos, ...this.platillas_vendidas, ...this.photographers_para_vender, invitation].find((item: any) => (item.slug === slug && item.active));
  }

  public async getDataById({ id }: { id: string }): Promise<any> {
    // const invitations: ConfirmationInviteContext[] = await lastValueFrom(this.getInvitationsAvailable());
    const invitation: ConfirmationInviteContext = await lastValueFrom(this.getInvitationById(id));
    return [...this.data, ...this.template_fijos, ...this.platillas_vendidas, ...this.photographers_para_vender, invitation].find((item: any) => (item.id === id && item.active || item.id_invitacion === id && item.active));
  }

  public getDataByInvitationId({ id }: { id: string }) {
    return this.http.get<any>(`${this.BACKEND_URL}${this.PATH}/invitation/${id}`).pipe(
      map((res) => res.data)
    );
  }

  public getInvitationsAvailable(): Observable<ConfirmationInviteContext[]> {
    return this.http.get<ConfirmationApiSuccess<ConfirmationInviteContext[]>>(
      `${this.BACKEND_URL}${this.PATH}/all/available`
    ).pipe(map((res) => res.data));
  }

  public getInvitationBySlug(slug: string): Observable<ConfirmationInviteContext> {
    return this.http.get<ConfirmationApiSuccess<ConfirmationInviteContext>>(
      `${this.BACKEND_URL}${this.PATH}/by-slug/${slug}`
    ).pipe(map((res) => res.data));
  }

  public getInvitationById(id: string): Observable<ConfirmationInviteContext> {
    return this.http.get<ConfirmationApiSuccess<ConfirmationInviteContext>>(
      `${this.BACKEND_URL}${this.PATH}/get-one/${id}`
    ).pipe(map((res) => res.data));
  }
}
