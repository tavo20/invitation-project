import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MainService } from '../shared/services/main.service';

interface DeliveryLink {
  key: string;
  label: string;
  description: string;
  url: string;
  openLabel: string;
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
    private main: MainService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound = true;
      return;
    }

    const record =
      (await this.main.getDataById_Invitation({ id })) ??
      this.main.getDataBySlug({ slug: id });

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
        url: data.linkInvitation ?? '',
        openLabel: 'Ver'
      },
      {
        key: 'confirm',
        label: 'Confirmación de asistencia',
        description: 'Formulario para que tus invitados confirmen si van',
        url: data.confirmLink ?? '',
        openLabel: 'Abrir'
      },
      {
        key: 'list',
        label: 'Lista de invitados',
        description: 'Consulta quiénes ya confirmaron y gestiona las respuestas',
        url: data.linkListInvitation ?? '',
        openLabel: 'Ver lista'
      }
    ].filter((link) => !!link.url);
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
