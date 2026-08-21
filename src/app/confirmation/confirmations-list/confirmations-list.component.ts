import { Component, HostBinding, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  ConfirmationDocument,
  ConfirmationService
} from '../../shared/services/confirmation.service';

@Component({
  selector: 'app-confirmations-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmations-list.component.html',
  styleUrl: './confirmations-list.component.scss'
})
export class ConfirmationsListComponent implements OnInit {
  invitationId: string | null = null;
  invitationNames = '';
  typeConfirmation = '';
  confirmations: ConfirmationDocument[] = [];
  loading = true;
  errorMessage = '';
  deletingId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.invitationId = this.route.snapshot.paramMap.get('id');
    if (!this.invitationId) {
      this.loading = false;
      this.errorMessage = 'No se encontró el id de la invitación.';
      return;
    }

    const context = this.confirmationService.getInvitationContext(this.invitationId);
    this.typeConfirmation = context?.data?.typeConfirmation ?? context?.typeConfirmation ?? '';
    if (context?.data) {
      this.invitationNames = [context.data.names1, context.data.names2]
        .filter(Boolean)
        .join(' & ');
    }

    void this.loadConfirmations();
  }

  @HostBinding('class.theme-basic')
  get isBasic(): boolean {
    return this.typeConfirmation === 'basic';
  }

  get totalGuests(): number {
    return this.confirmations.reduce(
      (sum, item) => sum + (Number(item.numero_confirmados) || 0),
      0
    );
  }

  async loadConfirmations(): Promise<void> {
    if (!this.invitationId) return;

    this.loading = true;
    this.errorMessage = '';

    try {
      this.confirmations = await this.confirmationService.getConfirmationsByInvitation(
        this.invitationId
      );
    } catch (error) {
      console.error('Error loading confirmations', error);
      this.errorMessage = 'No se pudieron cargar las confirmaciones.';
      this.confirmations = [];
    } finally {
      this.loading = false;
    }
  }

  async onDelete(item: ConfirmationDocument): Promise<void> {
    if (this.deletingId) return;

    const confirmed = window.confirm(
      `¿Eliminar la confirmación de "${item.names}"?\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    this.deletingId = item._id;

    try {
      await this.confirmationService.deleteConfirmation(item._id);
      this.confirmations = this.confirmations.filter((c) => c._id !== item._id);

      void this.loadConfirmations();
    } catch (error) {
      console.error('Error deleting confirmation', error);
      window.alert('No se pudo eliminar la confirmación. Intenta de nuevo.');
    } finally {
      this.deletingId = null;
    }
  }

  formatDate(value?: string): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
