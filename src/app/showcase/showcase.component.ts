import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PlantillaCard {
  nombre: string;
  estilo: string;
  descripcion: string;
  imagen: string;
  link: string;
  tags: string[];
}

@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.scss'
})
export class ShowcaseComponent {

  plantillas: PlantillaCard[] = [
    {
      nombre: 'Elegante Clásico',
      estilo: 'Negro & Dorado',
      descripcion: 'Caligrafía romántica, fotos a pantalla completa con efecto parallax y detalles dorados. Perfecta para bodas clásicas y sofisticadas.',
      imagen: 'assets/our-nataly/main.jpeg',
      link: '/?n=g-n',
      tags: ['Parallax', 'Música', 'Countdown', 'Animaciones']
    },
    {
      nombre: 'Rústico Natural',
      estilo: 'Verde Oliva',
      descripcion: 'Tonos verdes terrosos, iconos artesanales y ramitas decorativas. Ideal para bodas campestres y al aire libre.',
      imagen: 'assets/new-claude-our/portada.jpg',
      link: '/Gustavo-Gissel',
      tags: ['Parallax', 'Música', 'Countdown', 'Iconos SVG']
    },
    {
      nombre: 'Celestial Nocturno',
      estilo: 'Azul Noche & Plata',
      descripcion: 'Fondo azul noche con detalles plateados, foto enmarcada en arco, timeline del evento e iconos estelares. Para bodas nocturnas y elegantes.',
      imagen: 'assets/new-claude-our/basic_02.jpg',
      link: '/Laura-Juan',
      tags: ['Fondo Oscuro', 'Arco Decorativo', 'Timeline', 'Iconos Estelares']
    },
    {
      nombre: 'Botánico Dorado',
      estilo: 'Dorado & Hojas',
      descripcion: 'Monograma circular con las iniciales de la pareja, nombres en caligrafía sobre hojas decorativas y tonos dorados cálidos. Un clásico romántico.',
      imagen: 'assets/images/main-photo.png',
      link: '/?n=our',
      tags: ['Monograma', 'Música', 'Countdown', 'Dress Code']
    },
    {
      nombre: 'XV Años Elegante',
      estilo: 'Champagne & Marfil',
      descripcion: 'Diseñada para quinceañeras: itinerario con horarios, confirmación interactiva por WhatsApp, botón para copiar cuenta y hashtag para redes. Elegancia en tonos champagne.',
      imagen: 'assets/15_01/gabi_portada.jpeg',
      link: '/Mis-XV',
      tags: ['XV Años', 'Itinerario', 'RSVP Interactivo', 'Copiar Cuenta']
    }
  ];
}
