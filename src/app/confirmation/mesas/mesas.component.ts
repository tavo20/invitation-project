import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostBinding, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ConfirmationDocument,
  ConfirmationService
} from '../../shared/services/confirmation.service';
import { Mesa, MesaService } from '../../shared/services/mesa.service';

type GuestStatus = 'confirmado' | 'pendiente' | 'cancelada';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './mesas.component.html',
  styleUrl: './mesas.component.scss'
})
export class MesasComponent implements OnInit {
  invitationId: string | null = null;
  invitationNames = '';
  typeConfirmation = '';
  mesas: Mesa[] = [];
  confirmations: ConfirmationDocument[] = [];
  loading = true;
  errorMessage = '';
  actionMessage = '';
  selectedId: string | null = null;
  unassignedQuery = '';
  seatedQuery = '';
  private expandedIds = new Set<string>();
  savingId: string | null = null;
  showMesaModal = false;
  editingMesa: Mesa | null = null;
  savingMesa = false;
  mesaError = '';

  mesaForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    capacity: [8, [Validators.required, Validators.min(1)]]
  });

  constructor(
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private mesaService: MesaService,
    private fb: FormBuilder
  ) {}

  async ngOnInit(): Promise<void> {
    this.invitationId = this.route.snapshot.paramMap.get('id');
    if (!this.invitationId) {
      this.loading = false;
      this.errorMessage = 'No se encontró el id de la invitación.';
      return;
    }

    const context = await this.confirmationService.getInvitationContext(this.invitationId);
    this.typeConfirmation = context?.data?.typeConfirmation ?? context?.typeConfirmation ?? '';
    if (context?.data) {
      this.invitationNames = [context.data.names1, context.data.names2]
        .filter(Boolean)
        .join(' & ');
    }

    await this.load(true);
  }

  @HostBinding('class.theme-basic')
  get isBasic(): boolean {
    return this.typeConfirmation === 'basic';
  }

  get seatable(): ConfirmationDocument[] {
    return this.confirmations.filter((item) => {
      const status = this.getStatus(item);
      return status === 'confirmado' || status === 'pendiente';
    });
  }

  get unassigned(): ConfirmationDocument[] {
    const mesaIds = new Set(this.mesas.map((mesa) => mesa._id));
    return this.seatable.filter((item) => !item.mesa_id || !mesaIds.has(item.mesa_id));
  }

  get filteredUnassigned(): ConfirmationDocument[] {
    return this.unassigned.filter((item) => this.matchesQuery(item, this.unassignedQuery));
  }

  get visibleMesas(): Mesa[] {
    const query = this.seatedQuery.trim();
    if (!query) return this.mesas;
    return this.mesas.filter((mesa) => this.visibleGroups(mesa).length > 0);
  }

  get cancelled(): ConfirmationDocument[] {
    return this.confirmations.filter((item) => this.getStatus(item) === 'cancelada');
  }

  get selectedGuest(): ConfirmationDocument | null {
    return this.confirmations.find((item) => item._id === this.selectedId) ?? null;
  }

  groupsOn(mesa: Mesa): ConfirmationDocument[] {
    return this.seatable.filter((item) => item.mesa_id === mesa._id);
  }

  visibleGroups(mesa: Mesa): ConfirmationDocument[] {
    return this.groupsOn(mesa).filter((item) => this.matchesQuery(item, this.seatedQuery));
  }

  occupied(mesa: Mesa): number {
    return this.groupsOn(mesa).reduce(
      (sum, item) => sum + (Number(item.numero_confirmados) || 0),
      0
    );
  }

  isOver(mesa: Mesa): boolean {
    return this.occupied(mesa) > Number(mesa.capacity);
  }

  isOpen(mesa: Mesa): boolean {
    if (this.seatedQuery.trim() && this.visibleGroups(mesa).length > 0) return true;
    return this.expandedIds.has(mesa._id);
  }

  toggleMesa(mesa: Mesa): void {
    if (this.expandedIds.has(mesa._id)) this.expandedIds.delete(mesa._id);
    else this.expandedIds.add(mesa._id);
  }

  selectGuest(item: ConfirmationDocument): void {
    if (this.savingId) return;
    this.actionMessage = '';
    this.selectedId = this.selectedId === item._id ? null : item._id;
  }

  async assignTo(mesa: Mesa): Promise<void> {
    if (!this.selectedId || this.savingId) return;
    const guest = this.selectedGuest;
    if (!guest || guest.mesa_id === mesa._id) {
      this.selectedId = null;
      return;
    }

    this.savingId = guest._id;
    this.actionMessage = '';

    try {
      await this.confirmationService.updateConfirmation(guest._id, { mesa_id: mesa._id });
      this.selectedId = null;
      await this.load();
    } catch (error) {
      this.actionMessage = this.readError(error, 'No cabe en esta mesa.');
    } finally {
      this.savingId = null;
    }
  }

  async unassign(item: ConfirmationDocument): Promise<void> {
    if (this.savingId) return;
    this.savingId = item._id;
    this.actionMessage = '';

    try {
      await this.confirmationService.updateConfirmation(item._id, { mesa_id: null });
      if (this.selectedId === item._id) this.selectedId = null;
      await this.load();
    } catch (error) {
      this.actionMessage = this.readError(error, 'No se pudo quitar de la mesa.');
    } finally {
      this.savingId = null;
    }
  }

  openCreateMesa(): void {
    this.editingMesa = null;
    this.mesaError = '';
    this.mesaForm.reset({ name: '', capacity: 8 });
    this.showMesaModal = true;
  }

  openEditMesa(mesa: Mesa): void {
    this.editingMesa = mesa;
    this.mesaError = '';
    this.mesaForm.reset({
      name: mesa.name,
      capacity: Number(mesa.capacity) || 1
    });
    this.showMesaModal = true;
  }

  closeMesaModal(): void {
    if (this.savingMesa) return;
    this.showMesaModal = false;
    this.editingMesa = null;
    this.mesaError = '';
  }

  async saveMesa(): Promise<void> {
    if (!this.invitationId || this.savingMesa || this.mesaForm.invalid) {
      this.mesaForm.markAllAsTouched();
      return;
    }

    const name = String(this.mesaForm.value.name ?? '').trim();
    const capacity = Number(this.mesaForm.value.capacity);
    this.savingMesa = true;
    this.mesaError = '';

    try {
      if (this.editingMesa) {
        await this.mesaService.update(this.editingMesa._id, {
          name,
          capacity,
          order: this.editingMesa.order
        });
      } else {
        const order = this.mesas.reduce((max, mesa) => Math.max(max, Number(mesa.order) || 0), -1) + 1;
        await this.mesaService.create({
          id_invitacion: this.invitationId,
          name,
          capacity,
          order
        });
      }
      this.showMesaModal = false;
      this.editingMesa = null;
      await this.load();
    } catch (error) {
      this.mesaError = this.readError(error, 'No se pudo guardar la mesa.');
    } finally {
      this.savingMesa = false;
    }
  }

  async deleteMesa(mesa: Mesa): Promise<void> {
    if (this.savingId) return;
    const confirmed = window.confirm(`¿Eliminar ${mesa.name}? Los grupos vuelven a quedar sin mesa.`);
    if (!confirmed) return;

    this.savingId = mesa._id;
    this.actionMessage = '';

    try {
      await this.mesaService.delete(mesa._id);
      await this.load();
    } catch (error) {
      this.actionMessage = this.readError(error, 'No se pudo eliminar la mesa.');
    } finally {
      this.savingId = null;
    }
  }

  getStatus(item: ConfirmationDocument): GuestStatus | null {
    const status = String(item.status ?? '').trim().toLowerCase();
    if (status === 'confirmed' || status === 'confirmado') return 'confirmado';
    if (status === 'pending' || status === 'pendiente') return 'pendiente';
    if (status === 'cancelled' || status === 'canceled' || status === 'cancelada') return 'cancelada';
    return null;
  }

  private matchesQuery(item: ConfirmationDocument, query: string): boolean {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return item.names.toLowerCase().includes(term);
  }

  statusLabel(status: GuestStatus | null): string {
    if (status === 'confirmado') return 'Confirmado';
    if (status === 'pendiente') return 'Pendiente';
    if (status === 'cancelada') return 'Cancelado';
    return '';
  }

  private async load(initial = false): Promise<void> {
    if (!this.invitationId) return;
    if (initial) this.loading = true;
    this.errorMessage = '';

    try {
      const [mesas, confirmations] = await Promise.all([
        this.mesaService.getByInvitation(this.invitationId),
        this.confirmationService.getConfirmationsByInvitation(this.invitationId)
      ]);
      this.mesas = [...mesas].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
      this.confirmations = confirmations.filter((item) => !item.deleted);
    } catch (error) {
      console.error('Error loading seating', error);
      this.errorMessage = this.readError(error, 'No se pudo cargar el salón.');
    } finally {
      this.loading = false;
    }
  }

  private readError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message || fallback;
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  }
}
