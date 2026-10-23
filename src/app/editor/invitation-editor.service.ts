import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../galeria/models/galeria.models';
import { MediaProcessingService } from '../galeria/services/media-processing.service';
import { EditorInvitation, EditorUploadTarget } from './editor.models';
import { EDITABLE_TEMPLATES } from './template-schemas';

/** Debe coincidir con AUDIO_LIMITS del back. */
export const AUDIO_LIMITS = { maxMB: 10, maxSeconds: 6 * 60 };

/** Solo formatos que suenan en iPhone. El navegador no siempre reporta bien el tipo, por eso va por extensión. */
const AUDIO_TYPE_BY_EXT: Record<string, string> = {
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
};

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

  /** Revisa formato, peso y duración de la canción, la sube a R2 y devuelve su URL pública. */
  async uploadAudio(id: string, token: string, file: File): Promise<string> {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const contentType = AUDIO_TYPE_BY_EXT[ext];
    if (!contentType) throw new Error('La canción debe ser MP3 o M4A');
    if (file.size > AUDIO_LIMITS.maxMB * 1024 * 1024) {
      throw new Error(`La canción pesa demasiado (máx. ${AUDIO_LIMITS.maxMB} MB)`);
    }
    const duration = await this.audioDuration(file);
    if (duration > AUDIO_LIMITS.maxSeconds) {
      throw new Error(`La canción es muy larga (máx. ${AUDIO_LIMITS.maxSeconds / 60} minutos)`);
    }

    if (this.mock) return URL.createObjectURL(file);

    const [target] = await this.request(
      this.http.post<ApiResponse<EditorUploadTarget[]>>(
        `${this.API}/${id}/upload-url`,
        { files: [{ kind: 'audio', contentType, size: file.size, duration: Math.ceil(duration) }] },
        this.options(token),
      ),
    );
    await lastValueFrom(
      this.http.put(target.uploadUrl, file, { headers: new HttpHeaders({ 'Content-Type': contentType }) }),
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

  private audioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const audio = new Audio();
      const done = (fn: () => void) => {
        URL.revokeObjectURL(url);
        fn();
      };
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => done(() => resolve(audio.duration));
      audio.onerror = () => done(() => reject(new Error(`No pudimos leer "${file.name}". Prueba con un MP3.`)));
      audio.src = url;
    });
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
