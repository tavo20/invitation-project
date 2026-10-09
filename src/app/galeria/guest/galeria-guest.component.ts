import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Gallery, GalleryGuest, GalleryPost, PreparedMedia } from '../models/galeria.models';
import { GaleriaService } from '../services/galeria.service';
import { GaleriaSessionService } from '../services/galeria-session.service';
import { MediaProcessingService } from '../services/media-processing.service';
import { ConfirmationService } from '../../shared/services/confirmation.service';

type ViewMode = 'grid' | 'feed';

/** Cada cuánto se buscan publicaciones nuevas de otros invitados. */
const POLL_MS = 12000;
const DOUBLE_TAP_MS = 300;

@Component({
  selector: 'app-galeria-guest',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './galeria-guest.component.html',
  styleUrl: './galeria-guest.component.scss',
})
export class GaleriaGuestComponent implements OnInit, OnDestroy {
  invitationId = '';
  title = '';
  gallery: Gallery | null = null;
  guest!: GalleryGuest;

  loading = true;
  notFound = false;
  loadError = '';

  posts: GalleryPost[] = [];
  nextCursor: string | null = null;
  loadingMore = false;
  view: ViewMode = 'grid';

  /** Índice de la foto visible en cada carrusel (por id de post). */
  slideIndex: Record<string, number> = {};
  /** Post que muestra el corazón grande del doble toque. */
  heartBurstId: string | null = null;

  // ---------- Compositor ----------
  composerOpen = false;
  items: PreparedMedia[] = [];
  preparing = 0;
  composerErrors: string[] = [];
  caption = '';
  nameInput = '';
  emailInput = '';
  publishing = false;
  progress = 0;
  publishError = '';

  toast = '';

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  private observer?: IntersectionObserver;
  private pollTimer?: ReturnType<typeof setInterval>;
  private toastTimer?: ReturnType<typeof setTimeout>;
  private lastTap: { id: string; at: number } | null = null;

  constructor(
    private route: ActivatedRoute,
    private zone: NgZone,
    private galeria: GaleriaService,
    private session: GaleriaSessionService,
    private media: MediaProcessingService,
    private confirmation: ConfirmationService,
  ) {}

  /** El sentinel aparece cuando hay más páginas: al verse, carga la siguiente. */
  @ViewChild('sentinel') set sentinel(ref: ElementRef<HTMLElement> | undefined) {
    this.observer?.disconnect();
    if (!ref) return;
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) this.zone.run(() => this.loadMore());
      },
      { rootMargin: '600px 0px' },
    );
    this.observer.observe(ref.nativeElement);
  }

  async ngOnInit(): Promise<void> {
    this.invitationId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.route.snapshot.queryParamMap.get('mock')) this.galeria.useMock(this.invitationId);

    this.guest = this.session.getGuest();
    this.nameInput = this.guest.name;
    this.emailInput = this.guest.email;
    void this.loadTitle();

    try {
      this.gallery = await this.galeria.getGallery(this.invitationId);
      const page = await this.galeria.getPosts(this.invitationId, this.guest.session_id);
      this.posts = page.items;
      this.nextCursor = page.nextCursor;
      this.startPolling();
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) this.notFound = true;
      else this.loadError = this.galeria.errorMessage(error, 'No pudimos cargar la galería');
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    clearInterval(this.pollTimer);
    clearTimeout(this.toastTimer);
    this.releasePreviews();
    document.body.style.overflow = '';
  }

  get isOpen(): boolean {
    return this.gallery?.status === 'open';
  }

  get maxFiles(): number {
    return this.gallery?.limits.maxFilesPerPost ?? 10;
  }

  get isMock(): boolean {
    return this.galeria.isMock;
  }

  /** Recuadros con spinner mientras se preparan archivos. */
  get preparingSlots(): number[] {
    return Array.from({ length: this.preparing }, (_, i) => i);
  }

  get canPublish(): boolean {
    return !this.publishing && this.preparing === 0 && this.items.length > 0 && !!this.nameInput.trim();
  }

  // ---------- Carga ----------

  /** Nombres de la invitación para el encabezado (si no se encuentran, queda el título genérico). */
  private async loadTitle(): Promise<void> {
    try {
      const context = await this.confirmation.getInvitationContext(this.invitationId);
      const data = context?.data;
      this.title = [data?.names1, data?.names2].filter(Boolean).join(' & ') || data?.title || '';
    } catch {
      this.title = '';
    }
  }

  async loadMore(): Promise<void> {
    if (!this.nextCursor || this.loadingMore) return;
    this.loadingMore = true;
    try {
      const page = await this.galeria.getPosts(this.invitationId, this.guest.session_id, { cursor: this.nextCursor });
      this.posts = [...this.posts, ...page.items.filter((p) => !this.posts.some((q) => q._id === p._id))];
      this.nextCursor = page.nextCursor;
    } catch {
      // se reintenta la próxima vez que el sentinel entre en pantalla
    } finally {
      this.loadingMore = false;
    }
  }

  private startPolling(): void {
    this.zone.runOutsideAngular(() => {
      this.pollTimer = setInterval(() => {
        if (document.hidden || this.publishing) return;
        this.zone.run(() => void this.fetchNew());
      }, POLL_MS);
    });
  }

  private async fetchNew(): Promise<void> {
    const newest = this.posts[0]?.createdAt;
    if (!newest) {
      const page = await this.galeria.getPosts(this.invitationId, this.guest.session_id).catch(() => null);
      if (page && !this.posts.length) {
        this.posts = page.items;
        this.nextCursor = page.nextCursor;
      }
      return;
    }
    const page = await this.galeria
      .getPosts(this.invitationId, this.guest.session_id, { after: newest, limit: 50 })
      .catch(() => null);
    const fresh = page?.items.filter((p) => !this.posts.some((q) => q._id === p._id)) ?? [];
    if (fresh.length) this.posts = [...fresh, ...this.posts];
  }

  // ---------- Vista ----------

  setView(view: ViewMode): void {
    this.view = view;
  }

  /** Como en Instagram: tocar una miniatura abre el feed en esa publicación. */
  openInFeed(post: GalleryPost): void {
    this.view = 'feed';
    setTimeout(() => document.getElementById(`post-${post._id}`)?.scrollIntoView({ block: 'start' }));
  }

  onSlideScroll(post: GalleryPost, track: HTMLElement): void {
    const index = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    if (this.slideIndex[post._id] !== index) this.slideIndex[post._id] = index;
  }

  /** Proporción del recuadro: la de la primera foto, entre 4:5 y 1.91:1 (como Instagram). */
  aspect(post: GalleryPost): number {
    const first = post.media[0];
    const ratio = first?.width && first?.height ? first.width / first.height : 1;
    return Math.min(1.91, Math.max(0.8, ratio));
  }

  trackPost(_: number, post: GalleryPost): string {
    return post._id;
  }

  // ---------- Likes ----------

  onMediaTap(post: GalleryPost): void {
    const now = Date.now();
    if (this.lastTap?.id === post._id && now - this.lastTap.at < DOUBLE_TAP_MS) {
      this.lastTap = null;
      this.heartBurstId = post._id;
      setTimeout(() => {
        if (this.heartBurstId === post._id) this.heartBurstId = null;
      }, 900);
      if (!post.liked) void this.toggleLike(post);
      return;
    }
    this.lastTap = { id: post._id, at: now };
  }

  async toggleLike(post: GalleryPost): Promise<void> {
    // se ve al instante; si el servidor falla, se revierte
    const before = { liked: post.liked, likes: post.likes };
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    try {
      const result = await this.galeria.toggleLike(post._id, this.guest.session_id);
      post.liked = result.liked;
      post.likes = result.likes;
    } catch (error) {
      post.liked = before.liked;
      post.likes = before.likes;
      this.showToast(this.galeria.errorMessage(error, 'No se pudo dar like'));
    }
  }

  async deletePost(post: GalleryPost): Promise<void> {
    if (!confirm('¿Borrar esta publicación? No se puede deshacer.')) return;
    try {
      await this.galeria.deletePost(post._id, this.guest.session_id);
      this.posts = this.posts.filter((p) => p._id !== post._id);
      this.showToast('Publicación borrada');
    } catch (error) {
      this.showToast(this.galeria.errorMessage(error, 'No se pudo borrar'));
    }
  }

  // ---------- Compositor ----------

  pickFiles(): void {
    this.fileInput?.nativeElement.click();
  }

  async onFilesSelected(input: HTMLInputElement): Promise<void> {
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (!files.length || !this.gallery) return;

    if (!this.composerOpen) {
      this.composerOpen = true;
      this.composerErrors = [];
      this.publishError = '';
      document.body.style.overflow = 'hidden';
    }

    const room = this.maxFiles - this.items.length - this.preparing;
    if (files.length > room) {
      this.composerErrors.push(`Puedes subir hasta ${this.maxFiles} archivos por publicación`);
    }

    // de a uno: preparar varias fotos grandes a la vez puede agotar la memoria del celular
    for (const file of files.slice(0, Math.max(0, room))) {
      this.preparing++;
      try {
        const item = await this.media.prepare(file, this.gallery.limits);
        if (this.composerOpen) this.items.push(item);
        else URL.revokeObjectURL(item.previewUrl);
      } catch (error) {
        this.composerErrors.push(this.galeria.errorMessage(error, `No se pudo preparar "${file.name}"`));
      } finally {
        this.preparing--;
      }
    }
  }

  removeItem(index: number): void {
    const [item] = this.items.splice(index, 1);
    if (item) URL.revokeObjectURL(item.previewUrl);
  }

  closeComposer(): void {
    if (this.publishing) return;
    this.composerOpen = false;
    this.releasePreviews();
    this.items = [];
    this.caption = '';
    this.composerErrors = [];
    this.publishError = '';
    document.body.style.overflow = '';
  }

  async publish(): Promise<void> {
    if (!this.canPublish) return;
    this.guest = this.session.saveIdentity(this.nameInput, this.emailInput);
    this.publishing = true;
    this.publishError = '';
    this.progress = 0;

    try {
      const post = await this.galeria.publish(this.invitationId, this.guest, this.caption, this.items, (fraction) =>
        this.zone.run(() => (this.progress = fraction)),
      );
      if (!this.posts.some((p) => p._id === post._id)) this.posts = [post, ...this.posts];
      this.publishing = false;
      this.closeComposer();
      this.showToast(
        post.status === 'pending'
          ? 'Listo. Tu publicación se verá cuando los anfitriones la aprueben.'
          : '¡Publicado! 🎉',
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      this.publishing = false;
      this.publishError = this.galeria.errorMessage(error, 'No se pudo publicar. Intenta de nuevo.');
    }
  }

  private releasePreviews(): void {
    this.items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
  }

  // ---------- Utilidades ----------

  showToast(message: string): void {
    this.toast = message;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toast = ''), 3500);
  }

  initial(name: string): string {
    return (name || '?').trim().charAt(0).toUpperCase();
  }

  timeAgo(date: string): string {
    const seconds = Math.max(0, (Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'ahora';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.floor(hours / 24);
    return days === 1 ? 'ayer' : `hace ${days} días`;
  }

  duration(seconds?: number): string {
    const total = Math.round(seconds ?? 0);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  }
}
