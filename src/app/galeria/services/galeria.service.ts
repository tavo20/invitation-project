import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, lastValueFrom, filter, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CreatePostMedia,
  CreatePostPayload,
  Gallery,
  GalleryAdmin,
  GalleryConfigPatch,
  GalleryGuest,
  GalleryPost,
  PostStatus,
  PostsPage,
  PreparedMedia,
  UploadFileRequest,
  UploadTarget,
} from '../models/galeria.models';
import { GaleriaMockBackend } from './galeria-mock';

/** Cuántos archivos se suben a R2 al mismo tiempo. */
const PARALLEL_UPLOADS = 3;

@Injectable({ providedIn: 'root' })
export class GaleriaService {
  private readonly API = `${environment.apiUrl}api/galeria`;
  private mock: GaleriaMockBackend | null = null;

  constructor(private http: HttpClient) {}

  /** `?mock=1` en desarrollo: todo funciona en memoria, sin backend. */
  useMock(invitationId: string): void {
    if (environment.production) return;
    this.mock = new GaleriaMockBackend(invitationId);
  }

  get isMock(): boolean {
    return !!this.mock;
  }

  async getGallery(invitationId: string): Promise<Gallery> {
    if (this.mock) return this.mock.gallery();
    return this.request(this.http.get<ApiResponse<Gallery>>(`${this.API}/by-invitation/${invitationId}`));
  }

  async getPosts(
    invitationId: string,
    sessionId: string,
    opts: { cursor?: string | null; after?: string | null; limit?: number; mine?: boolean } = {},
  ): Promise<PostsPage> {
    const limit = opts.limit ?? 18;
    if (this.mock) return this.mock.list(sessionId, opts.cursor ?? null, opts.after ?? null, limit, !!opts.mine);

    const params: Record<string, string> = { session_id: sessionId, limit: String(limit) };
    if (opts.cursor) params['cursor'] = opts.cursor;
    if (opts.after) params['after'] = opts.after;
    // solo las del invitado (visibles y por aprobar)
    if (opts.mine) params['mine'] = '1';
    return this.request(this.http.get<ApiResponse<PostsPage>>(`${this.API}/${invitationId}/posts`, { params }));
  }

  async toggleLike(postId: string, sessionId: string): Promise<{ likes: number; liked: boolean }> {
    if (this.mock) return this.mock.like(postId, sessionId);
    return this.request(
      this.http.post<ApiResponse<{ likes: number; liked: boolean }>>(`${this.API}/posts/${postId}/like`, {
        session_id: sessionId,
      }),
    );
  }

  async deletePost(postId: string, sessionId: string): Promise<void> {
    if (this.mock) return this.mock.remove(postId, sessionId);
    await this.request(
      this.http.delete<ApiResponse<null>>(`${this.API}/posts/${postId}`, { body: { session_id: sessionId } }),
    );
  }

  /**
   * Publica: pide URLs firmadas, sube cada archivo directo a R2 y crea el post.
   * `onProgress` recibe un valor de 0 a 1 según los bytes subidos.
   */
  async publish(
    invitationId: string,
    guest: GalleryGuest,
    caption: string,
    items: PreparedMedia[],
    onProgress: (fraction: number) => void,
  ): Promise<GalleryPost> {
    // por cada archivo van dos subidas: el archivo y su miniatura
    const uploads: { body: Blob; request: UploadFileRequest }[] = items.flatMap((item) => [
      { body: item.file, request: { kind: item.type, contentType: item.contentType, size: item.file.size } },
      { body: item.thumb, request: { kind: 'thumb' as const, contentType: item.thumbType, size: item.thumb.size } },
    ]);

    const targets = await this.getUploadUrls(invitationId, guest.session_id, uploads.map((u) => u.request));

    const total = uploads.reduce((sum, u) => sum + u.body.size, 0) || 1;
    const loaded = new Array<number>(uploads.length).fill(0);
    const report = (index: number, bytes: number) => {
      loaded[index] = bytes;
      onProgress(loaded.reduce((a, b) => a + b, 0) / total);
    };

    await this.runPool(uploads.length, PARALLEL_UPLOADS, (i) =>
      this.putFile(targets[i], uploads[i].body, uploads[i].request.contentType, (bytes) => report(i, bytes)),
    );

    const media: CreatePostMedia[] = items.map((item, i) => ({
      key: targets[i * 2].key,
      thumbKey: targets[i * 2 + 1].key,
      type: item.type,
      width: item.width,
      height: item.height,
      ...(item.duration !== undefined ? { duration: item.duration } : {}),
    }));

    const payload: CreatePostPayload = {
      session_id: guest.session_id,
      author_name: guest.name,
      ...(guest.email ? { author_email: guest.email } : {}),
      ...(caption.trim() ? { caption: caption.trim() } : {}),
      media,
    };

    if (this.mock) return this.mock.createPost(payload);
    return this.request(this.http.post<ApiResponse<GalleryPost>>(`${this.API}/${invitationId}/posts`, payload));
  }

  // ---------- Anfitrión ----------

  async getAdmin(invitationId: string, token: string): Promise<GalleryAdmin> {
    if (this.mock) return this.mock.admin();
    return this.request(
      this.http.get<ApiResponse<GalleryAdmin>>(`${this.API}/${invitationId}/admin`, { headers: this.hostHeaders(token) }),
    );
  }

  async updateConfig(invitationId: string, token: string, patch: GalleryConfigPatch): Promise<Gallery> {
    if (this.mock) return this.mock.updateConfig(patch);
    return this.request(
      this.http.put<ApiResponse<Gallery>>(`${this.API}/${invitationId}/config`, patch, {
        headers: this.hostHeaders(token),
      }),
    );
  }

  async getAdminPosts(
    invitationId: string,
    token: string,
    opts: { status?: PostStatus | null; cursor?: string | null } = {},
  ): Promise<PostsPage> {
    if (this.mock) return this.mock.adminList(opts.status ?? null, opts.cursor ?? null, 30);
    const params: Record<string, string> = { limit: '30' };
    if (opts.status) params['status'] = opts.status;
    if (opts.cursor) params['cursor'] = opts.cursor;
    return this.request(
      this.http.get<ApiResponse<PostsPage>>(`${this.API}/${invitationId}/admin/posts`, {
        params,
        headers: this.hostHeaders(token),
      }),
    );
  }

  async setPostStatus(postId: string, token: string, status: 'visible' | 'hidden'): Promise<GalleryPost> {
    if (this.mock) return this.mock.setStatus(postId, status);
    return this.request(
      this.http.put<ApiResponse<GalleryPost>>(`${this.API}/posts/${postId}/status`, { status }, {
        headers: this.hostHeaders(token),
      }),
    );
  }

  async adminDeletePost(postId: string, token: string): Promise<void> {
    if (this.mock) return this.mock.adminRemove(postId);
    await this.request(
      this.http.delete<ApiResponse<null>>(`${this.API}/admin/posts/${postId}`, { headers: this.hostHeaders(token) }),
    );
  }

  /** Link de descarga directa del ZIP (el token va en la query porque es una descarga del navegador). */
  downloadUrl(invitationId: string, token: string): string {
    return `${this.API}/${invitationId}/download?token=${encodeURIComponent(token)}`;
  }

  private hostHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ 'X-Host-Token': token });
  }

  /** Mensaje legible para mostrar al invitado. */
  errorMessage(error: unknown, fallback = 'Algo salió mal, intenta de nuevo'): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) return 'Sin conexión. Revisa tu internet e intenta de nuevo.';
      return error.error?.message || fallback;
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  }

  // ---------- Internos ----------

  private async getUploadUrls(
    invitationId: string,
    sessionId: string,
    files: UploadFileRequest[],
  ): Promise<UploadTarget[]> {
    if (this.mock) return this.mock.uploadUrls(files);
    return this.request(
      this.http.post<ApiResponse<UploadTarget[]>>(`${this.API}/${invitationId}/upload-url`, {
        session_id: sessionId,
        files,
      }),
    );
  }

  /** PUT directo a R2. El Content-Type debe ser exactamente el que se pidió al firmar. */
  private async putFile(
    target: UploadTarget,
    body: Blob,
    contentType: string,
    onProgress: (bytes: number) => void,
  ): Promise<void> {
    if (this.mock) return this.mock.put(target, body, onProgress);
    await lastValueFrom(
      this.http
        .put(target.uploadUrl, body, {
          headers: new HttpHeaders({ 'Content-Type': contentType }),
          reportProgress: true,
          observe: 'events',
        })
        .pipe(
          tap((event) => {
            if (event.type === HttpEventType.UploadProgress) onProgress(event.loaded);
          }),
          filter((event) => event.type === HttpEventType.Response),
        ),
    );
    onProgress(body.size);
  }

  /** Ejecuta `count` tareas con un máximo de `size` a la vez. */
  private async runPool(count: number, size: number, task: (index: number) => Promise<void>): Promise<void> {
    let next = 0;
    const worker = async () => {
      while (next < count) {
        const index = next++;
        await task(index);
      }
    };
    await Promise.all(Array.from({ length: Math.min(size, count) }, worker));
  }

  private async request<T>(source: Observable<ApiResponse<T>>): Promise<T> {
    const response = await lastValueFrom(source);
    if (!response.success) throw new Error(response.message || 'Algo salió mal');
    return response.data;
  }
}
