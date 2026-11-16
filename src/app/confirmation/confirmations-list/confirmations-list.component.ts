import { Component, HostBinding, Input, OnInit, inject } from '@angular/core';
import { activarEvento } from '../../shared/evento-access/evento-access';
import { MarcaService, nombreDeMarca } from '../../shared/marca/marca.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MesaService } from '../../shared/services/mesa.service';
import {
  ConfirmationDocument,
  ConfirmationService
} from '../../shared/services/confirmation.service';

type ConfirmationStatus = 'confirmado' | 'pendiente' | 'cancelada';
type StatusFilter = 'todos' | ConfirmationStatus;

@Component({
  selector: 'app-confirmations-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './confirmations-list.component.html',
  styleUrl: './confirmations-list.component.scss'
})
export class ConfirmationsListComponent implements OnInit {
  /** Id del evento cuando se usa dentro de otra pantalla (panel); si no, sale de la URL. */
  @Input() idEvento?: string;
  /** Dentro del panel: sin fondo de página completa ni links a la otra pantalla. */
  @Input() @HostBinding('class.embebido') embebido = false;

  invitationId: string | null = null;
  invitationSlug: string | null = null;
  invitationNames = '';
  /** Fecha del evento tal como la muestra la invitación (para los archivos descargados). */
  fechaTexto = '';
  typeConfirmation = '';
  /** Antes dependía de `invitation_per_user`; ahora la lista siempre permite crear, filtrar y copiar links. */
  invitationPerUser = true;
  confirmations: ConfirmationDocument[] = [];
  loading = true;
  errorMessage = '';
  deletingId: string | null = null;
  showCreateModal = false;
  isCreating = false;
  createError = '';
  editingItem: ConfirmationDocument | null = null;
  copiedId: string | null = null;
  statusFilter: StatusFilter = 'todos';
  guestQuery = '';
  readonly statusFilters: StatusFilter[] = ['todos', 'confirmado', 'pendiente', 'cancelada'];
  readonly editStatuses: ConfirmationStatus[] = ['confirmado', 'pendiente', 'cancelada'];
  private readonly confirmationLinkBase = 'https://www.invitapp.art/invitation/confirmation/';

  createForm = this.fb.group({
    names: ['', [Validators.required, Validators.minLength(2)]],
    numero_confirmados: [1, [Validators.required, Validators.min(1)]],
    status: ['pendiente' as ConfirmationStatus, Validators.required]
  });

  constructor(
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private mesaService: MesaService
  ) {}

  async ngOnInit(): Promise<void> {
    this.invitationId = this.idEvento || this.route.snapshot.paramMap.get('id');
    activarEvento(this.invitationId);
    if (!this.invitationId) {
      this.loading = false;
      this.errorMessage = 'No se encontró el id de la invitación.';
      return;
    }


    const context = await this.confirmationService.getInvitationContext(this.invitationId);
    if (!context) {
      this.loading = false;
      this.errorMessage = 'No se encontró el contexto de la invitación.';
      return;
    }

    this.invitationSlug = context.slug ?? null;
    // Revisa si el listado debe ser por invitado
    this.typeConfirmation = context?.data?.typeConfirmation ?? context?.typeConfirmation ?? '';
    if (context?.data) {
      this.invitationNames = [context.data.names1, context.data.names2]
        .filter(Boolean)
        .join(' & ');
      this.fechaTexto = context.data.dateText || context.data.date || context.data.weddingDate || '';
    }

    void this.loadConfirmations();
  }

  @HostBinding('class.theme-basic')
  get isBasic(): boolean {
    return this.typeConfirmation === 'basic';
  }

  get createControls() {
    return this.createForm.controls;
  }

  onCreateInvitation(): void {
    this.createError = '';
    this.editingItem = null;
    this.createForm.reset({ names: '', numero_confirmados: 1, status: 'pendiente' });
    this.showCreateModal = true;
  }

  onEditInvitation(item: ConfirmationDocument): void {
    this.createError = '';
    this.editingItem = item;
    this.createForm.reset({
      names: item.names,
      numero_confirmados: Number(item.numero_confirmados) || 1,
      status: this.getStatus(item) ?? 'pendiente'
    });
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    if (this.isCreating) return;
    this.showCreateModal = false;
    this.createError = '';
    this.editingItem = null;
  }

  getConfirmationLink(item: ConfirmationDocument): string {
    return `https://www.invitapp.art/${this.invitationId}/${item._id}`;
    // return `http://localhost:4200/${this.invitationId}/${item._id}`;
  }

  async copyInvitationLink(item: ConfirmationDocument): Promise<void> {
    const link = this.getConfirmationLink(item);

    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const input = document.createElement('textarea');
      input.value = link;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }

    this.copiedId = item._id;
    window.setTimeout(() => {
      if (this.copiedId === item._id) this.copiedId = null;
    }, 1800);
  }

  changeGuests(delta: number): void {
    const current = Number(this.createForm.value.numero_confirmados ?? 1);
    this.createForm.patchValue({ numero_confirmados: Math.max(1, current + delta) });
  }

  async submitCreateInvitation(): Promise<void> {
    if (this.isCreating) return;

    const invitationId = this.invitationId;
    if (!invitationId || this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isCreating = true;
    this.createError = '';

    const names = String(this.createForm.value.names ?? '').trim();
    const numero_confirmados = Number(this.createForm.value.numero_confirmados ?? 1);

    try {
      if (this.editingItem) {
        await this.confirmationService.updateConfirmation(this.editingItem._id, {
          names,
          numero_confirmados,
          status: String(this.createForm.value.status ?? 'pendiente')
        });
      } else {
        await this.confirmationService.createInvitation({
          id_invitacion: invitationId,
          numero_confirmados,
          names
        });
      }

      this.showCreateModal = false;
      this.editingItem = null;
      this.createForm.reset({ names: '', numero_confirmados: 1, status: 'pendiente' });
      await this.loadConfirmations();
    } catch (error) {
      console.error('Error saving invitation', error);
      this.createError = this.editingItem
        ? 'No se pudo guardar la invitación. Intenta de nuevo.'
        : 'No se pudo crear la invitación. Intenta de nuevo.';
    } finally {
      this.isCreating = false;
    }
  }


  // ===== Descargas (Excel y PDF) =====
  private readonly marcas = inject(MarcaService);
  exportando: '' | 'excel' | 'pdf' = '';
  errorExport = '';

  async exportar(formato: 'excel' | 'pdf'): Promise<void> {
    if (this.exportando) return;
    this.exportando = formato;
    this.errorExport = '';
    try {
      const ex = await import('../../shared/exportar/exportar-evento');
      const marca = await this.marcas.porEvento(this.invitationId!);
      // Marca blanca: el archivo lo firma el planner; si no, InvitApp y el nombre del organizador
      const ev = {
        nombre: this.invitationNames || 'Evento',
        fecha: this.fechaTexto,
        marca: nombreDeMarca(marca),
        organizador: marca.marcaBlanca ? undefined : marca.nombre || undefined,
      };
      const mesas = await this.mesaService.getByInvitation(this.invitationId!).catch(() => []);
      if (formato === 'excel') await ex.confirmacionesExcel(ev, this.confirmations as any, mesas);
      else await ex.confirmacionesPdf(ev, this.confirmations as any, mesas);
    } catch (e) {
      console.error('Error exportando', e);
      this.errorExport = 'No pudimos generar el archivo. Intenta de nuevo.';
    } finally {
      this.exportando = '';
    }
  }

  get totalGuests(): number {
    return this.confirmations.reduce(
      (sum, item) => sum + (Number(item.numero_confirmados) || 0),
      0
    );
  }

  get statusSummary() {
    const summary: Record<ConfirmationStatus, { items: number; guests: number }> = {
      confirmado: { items: 0, guests: 0 },
      pendiente: { items: 0, guests: 0 },
      cancelada: { items: 0, guests: 0 }
    };

    for (const item of this.confirmations) {
      const status = this.getStatus(item);
      if (!status) continue;
      summary[status].items += 1;
      summary[status].guests += Number(item.numero_confirmados) || 0;
    }

    return summary;
  }

  get filteredConfirmations(): ConfirmationDocument[] {
    const query = this.guestQuery.trim().toLowerCase();
    const byStatus = this.statusFilter === 'todos'
      ? this.confirmations
      : this.confirmations.filter((item) => this.getStatus(item) === this.statusFilter);

    if (!query) return byStatus;
    return byStatus.filter((item) => item.names.toLowerCase().includes(query));
  }

  setStatusFilter(status: StatusFilter): void {
    this.statusFilter = this.statusFilter === status && status !== 'todos' ? 'todos' : status;
  }

  getStatus(item: ConfirmationDocument): ConfirmationStatus | null {
    const status = String(item.status ?? '').trim().toLowerCase();
    if (status === 'confirmed' || status === 'confirmado') return 'confirmado';
    if (status === 'pending' || status === 'pendiente') return 'pendiente';
    if (status === 'cancelled' || status === 'canceled' || status === 'cancelada') return 'cancelada';
    return null;
  }

  statusLabel(status: StatusFilter): string {
    if (status === 'todos') return 'Todos';
    if (status === 'confirmado') return 'Confirmado';
    if (status === 'pendiente') return 'Pendiente';
    return 'Cancelada';
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
