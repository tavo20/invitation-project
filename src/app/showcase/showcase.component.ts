import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PlantillaCard {
  nombre: string;
  estilo: string;
  descripcion: string;
  imagen: string;
  link: string;
  tags: string[];
  category: string;
}

@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.scss'
})
export class ShowcaseComponent {
  selectedCategory = 'Todas';

  plantillas: PlantillaCard[] = [
    {
      nombre: 'Elegante Clásico',
      estilo: 'Negro & Dorado',
      descripcion: 'Caligrafía romántica, fotos a pantalla completa con efecto parallax y detalles dorados. Perfecta para bodas clásicas y sofisticadas.',
      imagen: 'assets/our-nataly/main.jpeg',
      link: '/?n=g-n',
      tags: ['Parallax', 'Música', 'Countdown', 'Animaciones'],
      category: 'Boda'
    },
    {
      nombre: 'Rústico Natural',
      estilo: 'Verde Oliva',
      descripcion: 'Tonos verdes terrosos, iconos artesanales y ramitas decorativas. Ideal para bodas campestres y al aire libre.',
      imagen: 'assets/new-claude-our/portada.jpg',
      link: '/Gustavo-Gissel',
      tags: ['Parallax', 'Música', 'Countdown', 'Iconos SVG'],
      category: 'Boda'
    },
    {
      nombre: 'Celestial Nocturno',
      estilo: 'Azul Noche & Plata',
      descripcion: 'Fondo azul noche con detalles plateados, foto enmarcada en arco, timeline del evento e iconos estelares. Para bodas nocturnas y elegantes.',
      imagen: 'assets/new-claude-our/basic_02.jpg',
      link: '/Laura-Juan',
      tags: ['Fondo Oscuro', 'Arco Decorativo', 'Timeline', 'Iconos Estelares'],
      category: 'Boda'
    },
    {
      nombre: 'Botánico Dorado',
      estilo: 'Dorado & Hojas',
      descripcion: 'Monograma circular con las iniciales de la pareja, nombres en caligrafía sobre hojas decorativas y tonos dorados cálidos. Un clásico romántico.',
      imagen: 'assets/images/main-photo.png',
      link: '/?n=our',
      tags: ['Monograma', 'Música', 'Countdown', 'Dress Code'],
      category: 'Boda'
    },
    {
      nombre: 'XV Años Carmesí',
      estilo: 'Borgoña & Oro Rosa',
      descripcion: 'Una propuesta de XV años con portada cinematográfica, tonos rojizos elegantes, RSVP en modal y lluvia de sobres con estilo. Pensada para un look sofisticado y actual.',
      imagen: 'assets/15_02/Portada_2.jpeg',
      link: '/?n=xv-carmesi',
      tags: ['XV Años', 'Modal RSVP', 'Reveal Scroll', 'Lluvia de Sobres'],
      category: 'Quinceañera'
    },
    {
      nombre: 'Deluxe Black',
      estilo: 'Negro & Dorado',
      descripcion: 'Inspirada en una invitación premium tipo deluxe: hero oscuro, cartas elegantes, modales interactivos y animaciones suaves para una experiencia más sofisticada.',
      imagen: 'assets/15_02/Portada_2.jpeg',
      link: '/?n=xv-deluxe-black',
      tags: ['Deluxe', 'Black Theme', 'Modals', 'Animaciones'],
      category: 'Quinceañera'
    },
    {
      nombre: 'XV Años Elegante',
      estilo: 'Champagne & Marfil',
      descripcion: 'Diseñada para quinceañeras: itinerario con horarios, confirmación interactiva por WhatsApp, botón para copiar cuenta y hashtag para redes. Elegancia en tonos champagne.',
      imagen: 'assets/15_01/gabi_portada.jpeg',
      link: '/Mis-XV',
      tags: ['XV Años', 'Itinerario', 'RSVP Interactivo', 'Copiar Cuenta'],
      category: 'Quinceañera'
    }
  ];

  get categories(): string[] {
    return ['Todas', ...new Set(this.plantillas.map((plantilla) => plantilla.category))];
  }

  get filteredPlantillas(): PlantillaCard[] {
    if (this.selectedCategory === 'Todas') {
      return this.plantillas;
    }

    return this.plantillas.filter((plantilla) => plantilla.category === this.selectedCategory);
  }

  setCategory(category: string): void {
    this.selectedCategory = category;
  }
}
