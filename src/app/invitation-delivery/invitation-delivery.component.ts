import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MainService } from '../shared/services/main.service';
import { GaleriaService } from '../galeria/services/galeria.service';
import { downloadDataUrl, galleryGuestUrl, galleryQrDataUrl } from '../galeria/services/galeria-qr';

interface DeliveryLink {
  key: string;
  label: string;
  description: string;
  url: string;
  openLabel: string;
  /** QR del link (data URL), para imprimir. */
  qr?: string;
}

@Component({
  selector: 'app-invitation-delivery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invitation-delivery.component.html',
  styleUrl: './invitation-delivery.component.scss'
})
export class InvitationDeliveryComponent implements OnInit {
  clientName = '';
  names1 = '';
  names2 = '';
  dateText = '';
  links: DeliveryLink[] = [];
  notFound = false;
  copiedKey: string | null = null;
  private copyTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private route: ActivatedRoute,
    private main: MainService,
    private galeria: GaleriaService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound = true;
      return;
    }

    const record =
      (await this.main.getDataById_Invitation({ id })) 
      // ??
      // this.main.getDataBySlug({ slug: id });


    const data = record?.data;
    if (!data) {
      this.notFound = true;
      return;
    }

    this.clientName = data.nombreCliente ?? '';
    this.names1 = data.names1 ?? '';
    this.names2 = data.names2 ?? '';
    this.dateText = data.dateText ?? '';

    this.links = [
      {
        key: 'invitation',
        label: 'Ver la invitación',
        description: 'Abre la invitación digital o copia el link para enviarlo a tus invitados',
        url: record.slug
          ? `https://www.invitapp.art/${record.slug}`
          : '',
        openLabel: 'Ver'
      },
      {
        key: 'confirm',
        label: 'Confirmación de asistencia',
        description: 'Formulario para que tus invitados confirmen si van',
        url: record.id_invitation
        ? `https://www.invitapp.art/invitation/confirmation/${record.id_invitation  || record.id}`
        : '',
        openLabel: 'Abrir'
      },
      {
        key: 'list',
        label: 'Lista de invitados',
        description: 'Consulta quiénes ya confirmaron y gestiona las respuestas',
        url: record.id_invitation
        ? `https://www.invitapp.art/invitation/confirmations/list/${record.id_invitation || record.id}`
        : '',
        openLabel: 'Ver lista'
      }
    ].filter((link) => !!link.url);

    const invitationId = record.id_invitation || record.id;
    if (invitationId) void this.addGalleryLink(invitationId);
console.log(record);
    console.log(this.links);
  }

  /** La sección del álbum solo aparece si ya se creó la galería de esta invitación. */
  private async addGalleryLink(invitationId: string): Promise<void> {
    try {
      await this.galeria.getGallery(invitationId);
    } catch {
      return;
    }
    const url = galleryGuestUrl(invitationId);
    this.links = [
      ...this.links,
      {
        key: 'gallery',
        label: 'Álbum de fotos del evento',
        description: 'Tus invitados suben aquí sus fotos y videos. Imprime el QR y ponlo en las mesas',
        url,
        openLabel: 'Ver álbum',
        qr: await galleryQrDataUrl(url).catch(() => undefined)
      }
    ];
  }

  downloadQr(link: DeliveryLink): void {
    if (link.qr) downloadDataUrl(link.qr, `qr-album-${this.names1 || 'evento'}.png`);
  }

  async copyLink(link: DeliveryLink): Promise<void> {
    try {
      await navigator.clipboard.writeText(link.url);
      this.copiedKey = link.key;
      if (this.copyTimeout) clearTimeout(this.copyTimeout);
      this.copyTimeout = setTimeout(() => {
        this.copiedKey = null;
      }, 1800);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = link.url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      this.copiedKey = link.key;
      if (this.copyTimeout) clearTimeout(this.copyTimeout);
      this.copyTimeout = setTimeout(() => {
        this.copiedKey = null;
      }, 1800);
    }
  }
}
