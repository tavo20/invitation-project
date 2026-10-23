import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AudioField,
  EditableTemplate,
  EditorField,
  EditorInvitation,
  EditorSection,
  ListField,
} from './editor.models';
import { EDITABLE_TEMPLATES } from './template-schemas';
import { InvitationEditorService } from './invitation-editor.service';
import { PREVIEW_MESSAGE, PREVIEW_READY } from './preview-frame.component';

type Model = Record<string, unknown>;
type SaveState = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

const TOKEN_KEY = (id: string) => `editor_token_${id}`;
const AUTOSAVE_MS = 1200;

/**
 * Editor del cliente: /invitation/editar/:id?token=...
 * Lo que cambia se guarda solo como borrador; los invitados lo ven cuando el cliente toca "Publicar".
 * El token llega una vez en el link; se guarda en este navegador y se quita de la URL.
 */
@Component({
  selector: 'app-invitation-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invitation-editor.component.html',
  styleUrl: './invitation-editor.component.scss',
})
export class InvitationEditorComponent implements OnInit, OnDestroy {
  @ViewChild('previewFrame') previewFrame?: ElementRef<HTMLIFrameElement>;

  invitationId = '';
  private token = '';

  loading = true;
  /** 'missing': no hay token · 'invalid': el token no sirve · 'unsupported': la plantilla aún no se puede editar */
  blocked: 'missing' | 'invalid' | 'unsupported' | null = null;
  loadError = '';

  invitation: EditorInvitation | null = null;
  template: EditableTemplate | null = null;
  model: Model = {};

  saveState: SaveState = 'idle';
  hasDraft = false;
  publishing = false;
  openSection = 0;
  /** En celular se ve el formulario o la vista previa, no ambos. */
  mobileView: 'form' | 'preview' = 'form';
  /** Campos con una foto subiéndose, por key. */
  uploading: Record<string, boolean> = {};
  toast = '';

  private saveTimer?: ReturnType<typeof setTimeout>;
  private saving: Promise<void> | null = null;
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private editor: InvitationEditorService,
  ) {}

  get isMock(): boolean {
    return this.editor.isMock;
  }

  get invitationUrl(): string {
    return this.invitation?.slug ? `/${this.invitation.slug}` : '';
  }

  async ngOnInit(): Promise<void> {
    this.invitationId = this.route.snapshot.paramMap.get('id') ?? '';
    const query = this.route.snapshot.queryParamMap;

    if (query.get('mock')) {
      this.editor.useMock(this.invitationId);
      this.token = 'mock';
    } else {
      this.token = this.resolveToken(query.get('token'));
    }

    if (!this.token) {
      this.blocked = 'missing';
      this.loading = false;
      return;
    }

    try {
      const invitation = await this.editor.getEditor(this.invitationId, this.token);
      this.template = EDITABLE_TEMPLATES[invitation.template] ?? null;
      if (!this.template) {
        this.blocked = 'unsupported';
        return;
      }
      this.applyInvitation(invitation);
    } catch (error) {
      this.handleAccessError(error);
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.saveTimer);
    clearTimeout(this.toastTimer);
  }

  @HostListener('window:beforeunload', ['$event'])
  warnUnsaved(event: BeforeUnloadEvent): void {
    if (this.saveState === 'pending' || this.saveState === 'saving') {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  /** La vista previa avisa cuando cargó; ahí le mandamos la invitación. */
  @HostListener('window:message', ['$event'])
  onPreviewMessage(event: MessageEvent): void {
    if (event.origin !== window.location.origin || event.data?.type !== PREVIEW_READY) return;
    if (event.source !== this.previewFrame?.nativeElement.contentWindow) return;
    this.syncPreview();
  }

  // ---------- Valores ----------

  value(key: string): unknown {
    return this.model[key];
  }

  text(key: string): string {
    const value = this.model[key];
    return typeof value === 'string' ? value : '';
  }

  array<T = unknown>(key: string): T[] {
    const value = this.model[key];
    return Array.isArray(value) ? (value as T[]) : [];
  }

  setValue(key: string, value: unknown): void {
    // objeto nuevo en cada cambio para que la vista previa (OnChanges) se entere
    this.model = { ...this.model, [key]: value };
    this.syncPreview();
    this.scheduleSave();
  }

  onText(key: string, event: Event): void {
    this.setValue(key, (event.target as HTMLInputElement | HTMLTextAreaElement).value);
  }

  onToggle(key: string, event: Event): void {
    this.setValue(key, (event.target as HTMLInputElement).checked);
  }

  /** "June 12, 2027 16:30:00" o "2027-06-12T16:30:00" → valor de <input type="datetime-local">. */
  dateTimeInput(key: string): string {
    const date = new Date(this.text(key));
    if (isNaN(date.getTime())) return '';
    const pad = (n: number) => `${n}`.padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  onDateTime(key: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value) this.setValue(key, `${value}:00`);
  }

  // ---------- Listas ----------

  updateItem(key: string, index: number, value: unknown): void {
    const items = [...this.array(key)];
    items[index] = value;
    this.setValue(key, items);
  }

  onListText(field: ListField, index: number, itemKey: string, event: Event): void {
    const item = (this.array<Record<string, string>>(field.key)[index]) ?? {};
    this.updateItem(field.key, index, { ...item, [itemKey]: (event.target as HTMLInputElement).value });
  }

  addListItem(field: ListField): void {
    const empty = Object.fromEntries(field.itemFields.map((f) => [f.key, '']));
    this.setValue(field.key, [...this.array(field.key), empty]);
  }

  addColor(key: string): void {
    this.setValue(key, [...this.array(key), '#c4b8ad']);
  }

  onColor(key: string, index: number, event: Event): void {
    this.updateItem(key, index, (event.target as HTMLInputElement).value);
  }

  removeItem(key: string, index: number): void {
    this.setValue(key, this.array(key).filter((_, i) => i !== index));
  }

  moveItem(key: string, index: number, direction: -1 | 1): void {
    const items = [...this.array(key)];
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    this.setValue(key, items);
  }

  // ---------- Fotos ----------

  async onImagePicked(key: string, event: Event, index?: number): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const busyKey = index === undefined ? key : `${key}.${index}`;
    this.uploading = { ...this.uploading, [busyKey]: true };
    try {
      const url = await this.editor.uploadImage(this.invitationId, this.token, file);
      if (index === undefined) this.setValue(key, url);
      else if (index >= this.array(key).length) this.setValue(key, [...this.array(key), url]);
      else this.updateItem(key, index, url);
    } catch (error) {
      this.showToast(this.editor.errorMessage(error, 'No se pudo subir la foto'));
    } finally {
      const { [busyKey]: _, ...rest } = this.uploading;
      this.uploading = rest;
    }
  }

  async onAudioPicked(field: AudioField, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.uploading = { ...this.uploading, [field.key]: true };
    try {
      const url = await this.editor.uploadAudio(this.invitationId, this.token, file);
      this.model = { ...this.model, [field.nameKey]: file.name.replace(/\.[^.]+$/, '') };
      this.setValue(field.key, url);
    } catch (error) {
      this.showToast(this.editor.errorMessage(error, 'No se pudo subir la canción'));
    } finally {
      const { [field.key]: _, ...rest } = this.uploading;
      this.uploading = rest;
    }
  }

  /** Vuelve a la canción que trae la plantilla. */
  resetAudio(field: AudioField): void {
    this.model = { ...this.model, [field.nameKey]: this.template!.defaults[field.nameKey] };
    this.setValue(field.key, this.template!.defaults[field.key]);
  }

  isDefault(key: string): boolean {
    return this.model[key] === this.template?.defaults[key];
  }

  isUploading(key: string, index?: number): boolean {
    return !!this.uploading[index === undefined ? key : `${key}.${index}`];
  }

  // ---------- Guardar y publicar ----------

  async publish(): Promise<void> {
    if (this.publishing) return;
    this.publishing = true;
    try {
      await this.flushSave();
      if (this.saveState === 'error') return;
      const invitation = await this.editor.publish(this.invitationId, this.token);
      this.invitation = invitation;
      this.hasDraft = invitation.hasDraft;
      this.showToast('¡Listo! Tus invitados ya ven los cambios.');
    } catch (error) {
      this.showToast(this.editor.errorMessage(error, 'No se pudieron publicar los cambios'));
    } finally {
      this.publishing = false;
    }
  }

  async discard(): Promise<void> {
    if (!confirm('¿Descartar los cambios sin publicar? La invitación vuelve a como la ven tus invitados.')) return;
    clearTimeout(this.saveTimer);
    try {
      await this.saving;
      this.applyInvitation(await this.editor.discardDraft(this.invitationId, this.token));
      this.showToast('Cambios descartados');
    } catch (error) {
      this.showToast(this.editor.errorMessage(error, 'No se pudieron descartar los cambios'));
    }
  }

  /** Un campo se esconde si antes de él hay un toggle de sección apagado. */
  isFieldVisible(section: EditorSection, index: number): boolean {
    return !section.fields
      .slice(0, index)
      .some((f) => f.type === 'toggle' && f.controlsSection && !this.model[f.key]);
  }

  isSectionOff(section: EditorSection): boolean {
    return section.fields.some((f) => f.type === 'toggle' && f.controlsSection && !this.model[f.key]);
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByKey(_: number, field: EditorField): string {
    return field.key;
  }

  private scheduleSave(): void {
    this.saveState = 'pending';
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => void this.flushSave(), AUTOSAVE_MS);
  }

  /** Guarda ya lo pendiente; si hay un guardado en curso, espera y vuelve a guardar lo último. */
  private async flushSave(): Promise<void> {
    clearTimeout(this.saveTimer);
    if (this.saving) await this.saving;
    if (this.saveState !== 'pending' && this.saveState !== 'error') return;

    const snapshot = this.model;
    this.saveState = 'saving';
    this.saving = this.editor
      .saveDraft(this.invitationId, this.token, snapshot)
      .then(() => {
        this.hasDraft = true;
        // si el cliente siguió escribiendo mientras se guardaba, queda pendiente
        this.saveState = this.model === snapshot ? 'saved' : 'pending';
        if (this.saveState === 'pending') this.scheduleSave();
      })
      .catch((error) => {
        this.saveState = 'error';
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.handleAccessError(error);
          return;
        }
        this.showToast(this.editor.errorMessage(error, 'No se pudo guardar. Revisa tu conexión.'));
      })
      .finally(() => {
        this.saving = null;
      });
    await this.saving;
  }

  /** Arranca el formulario: lo que trae la invitación y, en lo que falte, el ejemplo de la plantilla. */
  private applyInvitation(invitation: EditorInvitation): void {
    this.invitation = invitation;
    this.hasDraft = invitation.hasDraft;
    const model: Model = { ...invitation.data };
    for (const section of this.template!.schema.sections) {
      for (const field of section.fields) {
        const keys = field.type === 'audio' ? [field.key, field.nameKey] : [field.key];
        for (const key of keys) {
          if (model[key] === undefined && this.template!.defaults[key] !== undefined) {
            model[key] = structuredClone(this.template!.defaults[key]);
          }
        }
      }
    }
    this.model = model;
    this.saveState = 'idle';
    this.syncPreview();
  }

  private syncPreview(): void {
    this.previewFrame?.nativeElement.contentWindow?.postMessage(
      { type: PREVIEW_MESSAGE, template: this.invitation?.template, data: this.model },
      window.location.origin,
    );
  }

  private resolveToken(fromUrl: string | null): string {
    if (fromUrl) {
      try {
        localStorage.setItem(TOKEN_KEY(this.invitationId), fromUrl);
      } catch {
        // sin almacenamiento: el token sirve solo mientras esta pestaña esté abierta
      }
      void this.router.navigate([], { queryParams: { token: null }, queryParamsHandling: 'merge', replaceUrl: true });
      return fromUrl;
    }
    try {
      return localStorage.getItem(TOKEN_KEY(this.invitationId)) ?? '';
    } catch {
      return '';
    }
  }

  private handleAccessError(error: unknown): void {
    if (error instanceof HttpErrorResponse && error.status === 401) {
      this.blocked = 'invalid';
      try {
        localStorage.removeItem(TOKEN_KEY(this.invitationId));
      } catch {
        // nada que limpiar
      }
    } else {
      this.loadError = this.editor.errorMessage(error, 'No pudimos abrir el editor');
    }
  }

  private showToast(message: string): void {
    this.toast = message;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toast = ''), 3500);
  }
}
