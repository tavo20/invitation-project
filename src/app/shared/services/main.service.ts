import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MainService {

  public template_fijos: any = [
    {
      id: 1,
      slug: "gus-gi",
      data: {

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
      data: {},
      template: "laura-juan",
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
  ]
  constructor() { }

  public getData() {
    return this.data;
  }

  public getDataBySlug({ slug }: { slug: string }) {
    return [...this.data, ...this.template_fijos].find((item: any) => (item.slug === slug && item.active));
  }
}
