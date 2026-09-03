import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import {
  ConfirmationDocument,
  ConfirmationService
} from '../shared/services/confirmation.service';
import { MainService } from '../shared/services/main.service';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.scss'
})
export class TicketComponent implements OnInit {
  loading = true;
  errorMessage = '';
  eventName = '';
  eventDate = '';
  eventLocation = '';
  guestNames = '';
  guestsCount = 0;
  status = '';
  ticketUrl = '';
  qrSrc = '';
  isScanView = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService,
    private main: MainService
  ) {}

  async ngOnInit(): Promise<void> {
    const invitationParam = this.route.snapshot.paramMap.get('id');
    const confirmationId = this.route.snapshot.paramMap.get('confirmationId');

    if (!invitationParam || !confirmationId) {
      this.loading = false;
      this.errorMessage = 'Este enlace de entrada no es válido.';
      return;
    }

    this.isScanView = this.route.snapshot.queryParamMap.get('check') === '1';
    this.ticketUrl = `${window.location.origin}/invitation/ticket/${invitationParam}/${confirmationId}?check=1`;
    this.qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(this.ticketUrl)}`;

    try {
      const record =
        (await this.main.getDataBySlug({ slug: invitationParam })) ??
        (await this.main.getDataById_Invitation({ id: invitationParam }));

      const data = record?.data;
      if (data) {
        this.eventName = [data.names1, data.names2].filter(Boolean).join(' & ') || data.eventTitle || 'Evento';
        this.eventDate = data.dateText || '';
        this.eventLocation = data.eventLocation || '';
      }

      const response = await lastValueFrom(
        this.confirmationService.getConfirmationInvitationById(confirmationId)
      );
      const guest = (response?.data ?? response) as ConfirmationDocument | null;

      if (!guest?._id && !guest?.names) {
        this.errorMessage = 'No se encontró la entrada de estos invitados.';
        this.loading = false;
        return;
      }

      this.guestNames = guest.names ?? '';
      this.guestsCount = Number(guest.numero_confirmados) || 0;
      this.status = String(guest.status ?? '').trim().toLowerCase();
    } catch (error) {
      console.error('Error loading ticket', error);
      this.errorMessage = 'No se pudo cargar la entrada.';
    } finally {
      this.loading = false;
    }
  }

  get isCancelled(): boolean {
    return this.status === 'cancelada' || this.status === 'cancelled' || this.status === 'canceled';
  }

  get isConfirmed(): boolean {
    return this.status === 'confirmado' || this.status === 'confirmed';
  }

  statusLabel(): string {
    if (this.isConfirmed) return 'Confirmado';
    if (this.isCancelled) return 'Cancelada';
    if (this.status === 'pendiente' || this.status === 'pending') return 'Pendiente';
    return this.status || 'Pendiente';
  }

  goBack(): void {
    const invitationParam = this.route.snapshot.paramMap.get('id');
    const confirmationId = this.route.snapshot.paramMap.get('confirmationId');
    if (invitationParam && confirmationId) {
      this.router.navigate(['/', invitationParam, confirmationId]);
      return;
    }
    if (invitationParam) {
      this.router.navigate(['/', invitationParam]);
      return;
    }
    this.router.navigate(['/']);
  }
}
