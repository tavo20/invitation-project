import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { GalleryAdmin, GalleryPost, PostStatus } from '../models/galeria.models';
import { GaleriaService } from '../services/galeria.service';
import { downloadDataUrl, galleryGuestUrl, galleryQrDataUrl } from '../services/galeria-qr';
import { ConfirmationService } from '../../shared/services/confirmation.service';

type Filter = 'all' | PostStatus;

const TOKEN_KEY = (id: string) => `galeria_host_${id}`;

/**
 * Panel del anfitrión: /invitation/galeria/:id/admin?token=...
 * El token llega una vez en el link; se guarda en este navegador y se quita de la URL
 * para que no quede a la vista (capturas de pantalla, historial compartido).
 */
@Component({
  selector: 'app-galeria-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './galeria-admin.component.html',
  styleUrl: './galeria-admin.component.scss',
})
export class GaleriaAdminComponent implements OnInit, OnDestroy {
  invitationId = '';
  title = '';
  private token = '';

  loading = true;
  /** 'missing': no hay token · 'invalid': el token no sirve · 'notFound': no hay galería */
  blocked: 'missing' | 'invalid' | 'notFound' | null = null;
  loadError = '';

  admin: GalleryAdmin | null = null;
  savingConfig = false;

  filter: Filter = 'all';
  posts: GalleryPost[] = [];
  nextCursor: string | null = null;
  loadingPosts = false;
  busyPostId: string | null = null;

  guestUrl = '';
  qr = '';
  copied = false;
  viewing: GalleryPost | null = null;
  toast = '';
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private galeria: GaleriaService,
    private confirmation: ConfirmationService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.invitationId = this.route.snapshot.paramMap.get('id') ?? '';
    const query = this.route.snapshot.queryParamMap;

    if (query.get('mock')) {
      this.galeria.useMock(this.invitationId);
      this.token = 'mock';
    } else {
      this.token = this.resolveToken(query.get('token'));
    }

    if (!this.token) {
      this.blocked = 'missing';
      this.loading = false;
      return;
    }

    this.guestUrl = galleryGuestUrl(this.invitationId);
    void galleryQrDataUrl(this.guestUrl).then((qr) => (this.qr = qr)).catch(() => undefined);
    void this.loadTitle();

    try {
      this.admin = await this.galeria.getAdmin(this.invitationId, this.token);
      await this.loadPosts(true);
    } catch (error) {
      this.handleAccessError(error);
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.toastTimer);
  }

  get isMock(): boolean {
    return this.galeria.isMock;
  }

  get isOpen(): boolean {
    return this.admin?.gallery.status === 'open';
  }

  // ---------- Acceso ----------

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
    } else if (error instanceof HttpErrorResponse && error.status === 404) {
      this.blocked = 'notFound';
    } else {
      this.loadError = this.galeria.errorMessage(error, 'No pudimos cargar el panel');
    }
  }

  private async loadTitle(): Promise<void> {
    try {
      const data = (await this.confirmation.getInvitationContext(this.invitationId))?.data;
      this.title = [data?.names1, data?.names2].filter(Boolean).join(' & ');
    } catch {
      this.title = '';
    }
  }

  // ---------- Configuración ----------

  async toggleOpen(): Promise<void> {
    await this.saveConfig({ status: this.isOpen ? 'closed' : 'open' });
    this.showToast(this.isOpen ? 'Álbum abierto: los invitados pueden subir fotos' : 'Álbum cerrado: ya no se pueden subir fotos');
  }

  async toggleApproval(): Promise<void> {
    const next = !this.admin?.gallery.requireApproval;
    await this.saveConfig({ requireApproval: next });
    this.showToast(next ? 'Las nuevas fotos esperarán tu aprobación' : 'Las nuevas fotos se publican al instante');
  }

  private async saveConfig(patch: { status?: 'open' | 'closed'; requireApproval?: boolean }): Promise<void> {
    if (!this.admin || this.savingConfig) return;
    this.savingConfig = true;
    try {
      const gallery = await this.galeria.updateConfig(this.invitationId, this.token, patch);
      this.admin = {
        ...this.admin,
        gallery: { ...this.admin.gallery, status: gallery.status, requireApproval: gallery.requireApproval },
      };
    } catch (error) {
      this.showToast(this.galeria.errorMessage(error, 'No se pudo guardar el cambio'));
    } finally {
      this.savingConfig = false;
    }
  }

  // ---------- Publicaciones ----------

  async setFilter(filter: Filter): Promise<void> {
    if (this.filter === filter) return;
    this.filter = filter;
    await this.loadPosts(true);
  }

  async loadPosts(reset = false): Promise<void> {
    if (this.loadingPosts) return;
    this.loadingPosts = true;
    try {
      const page = await this.galeria.getAdminPosts(this.invitationId, this.token, {
        status: this.filter === 'all' ? null : this.filter,
        cursor: reset ? null : this.nextCursor,
      });
      this.posts = reset ? page.items : [...this.posts, ...page.items];
      this.nextCursor = page.nextCursor;
    } catch (error) {
      this.showToast(this.galeria.errorMessage(error, 'No se pudieron cargar las publicaciones'));
    } finally {
      this.loadingPosts = false;
    }
  }

  async setStatus(post: GalleryPost, status: 'visible' | 'hidden'): Promise<void> {
    this.busyPostId = post._id;
    try {
      const updated = await this.galeria.setPostStatus(post._id, this.token, status);
      // si ya no corresponde al filtro actual, sale de la lista
      this.posts =
        this.filter === 'all'
          ? this.posts.map((p) => (p._id === post._id ? { ...p, status: updated.status } : p))
          : this.posts.filter((p) => p._id !== post._id);
      await this.refreshStats();
    } catch (error) {
      this.showToast(this.galeria.errorMessage(error, 'No se pudo cambiar el estado'));
    } finally {
      this.busyPostId = null;
    }
  }

  async remove(post: GalleryPost): Promise<void> {
    if (!confirm(`¿Borrar la publicación de ${post.author.name}? Se eliminan sus fotos y videos y no se puede deshacer.`)) {
      return;
    }
    this.busyPostId = post._id;
    try {
      await this.galeria.adminDeletePost(post._id, this.token);
      this.posts = this.posts.filter((p) => p._id !== post._id);
      if (this.viewing?._id === post._id) this.viewing = null;
      await this.refreshStats();
      this.showToast('Publicación borrada');
    } catch (error) {
      this.showToast(this.galeria.errorMessage(error, 'No se pudo borrar'));
    } finally {
      this.busyPostId = null;
    }
  }

  private async refreshStats(): Promise<void> {
    try {
      this.admin = await this.galeria.getAdmin(this.invitationId, this.token);
    } catch {
      // las cifras se actualizan en la próxima carga
    }
  }

  // ---------- Compartir y descargar ----------

  async copyGuestLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.guestUrl);
      this.copied = true;
      setTimeout(() => (this.copied = false), 1800);
    } catch {
      this.showToast('No se pudo copiar, mantén presionado el link para copiarlo');
    }
  }

  downloadQr(): void {
    if (this.qr) downloadDataUrl(this.qr, `qr-album-${this.title || this.invitationId}.png`);
  }

  downloadAlbum(): void {
    if (this.isMock) {
      this.showToast('En modo de prueba no hay archivos para descargar');
      return;
    }
    // descarga normal del navegador: el ZIP se va armando en el servidor mientras baja
    window.location.href = this.galeria.downloadUrl(this.invitationId, this.token);
  }

  // ---------- Utilidades ----------

  showToast(message: string): void {
    this.toast = message;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toast = ''), 3500);
  }

  size(bytes: number): string {
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
    return `${Math.max(0, Math.round(bytes / 1024 ** 2))} MB`;
  }

  timeAgo(date: string): string {
    const minutes = Math.floor(Math.max(0, Date.now() - new Date(date).getTime()) / 60000);
    if (minutes < 1) return 'ahora';
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.floor(hours / 24);
    return days === 1 ? 'ayer' : `hace ${days} días`;
  }

  trackPost(_: number, post: GalleryPost): string {
    return post._id;
  }
}
