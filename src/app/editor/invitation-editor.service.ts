import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../galeria/models/galeria.models';
import { MediaProcessingService } from '../galeria/services/media-processing.service';
import { EditorInvitation, EditorUploadTarget } from './editor.models';
import { EDITABLE_TEMPLATES } from './template-schemas';

const IMAGE_LIMITS = { maxImageMB: 15, maxVideoMB: 0, maxVideoSeconds: 0, maxFilesPerPost: 1, maxUploadsPerGuest: 0 };

@Injectable({ providedIn: 'root' })
export class InvitationEditorService {
  private readonly API = `${environment.apiUrl}api/invitation-template`;
  /** `?mock=1` en desarrollo: una invitación Neblina en memoria, nada se guarda. */
  private mock: EditorInvitation | null = null;

  constructor(private http: HttpClient, private media: MediaProcessingService) {}

  useMock(invitationId: string): void {
    if (environment.production) return;
    this.mock = {
      id_invitation: invitationId,
      slug: 'neblina',
      template: 'neblina',
      data: { ...EDITABLE_TEMPLATES['neblina'].defaults },
      hasDraft: false,
      published_at: null,
    };
  }

  get isMock(): boolean {
    return !!this.mock;
  }

  getEditor(id: string, token: string): Promise<EditorInvitation> {
    if (this.mock) return Promise.resolve(this.mockCopy());
    return this.request(this.http.get<ApiResponse<EditorInvitation>>(`${this.API}/${id}/editor`, this.options(token)));
  }

  saveDraft(id: string, token: string, data: Record<string, unknown>): Promise<EditorInvitation> {
    if (this.mock) {
      this.mock = { ...this.mock, data: { ...data }, hasDraft: true };
      return Promise.resolve(this.mockCopy());
    }
    return this.request(
      this.http.put<ApiResponse<EditorInvitation>>(`${this.API}/${id}/draft`, { data }, this.options(token)),
    );
  }

  publish(id: string, token: string): Promise<EditorInvitation> {
    if (this.mock) {
      this.mock = { ...this.mock, hasDraft: false, published_at: new Date().toISOString() };
      return Promise.resolve(this.mockCopy());
    }
    return this.request(
      this.http.post<ApiResponse<EditorInvitation>>(`${this.API}/${id}/publish`, {}, this.options(token)),
    );
  }

  discardDraft(id: string, token: string): Promise<EditorInvitation> {
    if (this.mock) {
      this.mock = { ...this.mock, hasDraft: false };
      return Promise.resolve(this.mockCopy());
    }
    return this.request(
      this.http.post<ApiResponse<EditorInvitation>>(`${this.API}/${id}/discard-draft`, {}, this.options(token)),
    );
  }

  /** Comprime la foto en el navegador, la sube a R2 y devuelve su URL pública. */
  async uploadImage(id: string, token: string, file: File): Promise<string> {
    const prepared = await this.media.prepare(file, IMAGE_LIMITS);
    URL.revokeObjectURL(prepared.previewUrl);
    if (prepared.type !== 'image') throw new Error('Solo se pueden subir fotos');

    if (this.mock) return URL.createObjectURL(prepared.file);

    const [target] = await this.request(
      this.http.post<ApiResponse<EditorUploadTarget[]>>(
        `${this.API}/${id}/upload-url`,
        { files: [{ contentType: prepared.contentType, size: prepared.file.size }] },
        this.options(token),
      ),
    );
    await lastValueFrom(
      this.http.put(target.uploadUrl, prepared.file, {
        headers: new HttpHeaders({ 'Content-Type': prepared.contentType }),
      }),
    );
    return target.publicUrl;
  }

  /** Mensaje legible para mostrar al cliente. */
  errorMessage(error: unknown, fallback = 'Algo salió mal, intenta de nuevo'): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) return 'Sin conexión. Revisa tu internet e intenta de nuevo.';
      return error.error?.message || fallback;
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  }

  private options(token: string) {
    return { headers: new HttpHeaders({ 'X-Edit-Token': token }) };
  }

  private mockCopy(): EditorInvitation {
    return { ...this.mock!, data: { ...this.mock!.data } };
  }

  private async request<T>(obs: Observable<ApiResponse<T>>): Promise<T> {
    const res = await lastValueFrom(obs);
    if (!res.success) throw new Error(res.message || 'Algo salió mal, intenta de nuevo');
    return res.data;
  }
}
