import {
  CreatePostPayload,
  Gallery,
  GalleryAdmin,
  GalleryConfigPatch,
  GalleryPost,
  PostStatus,
  PostsPage,
  UploadFileRequest,
  UploadTarget,
} from '../models/galeria.models';

/**
 * Backend simulado en memoria para probar la galería sin servidor ni R2.
 * Se activa en desarrollo con `?mock=1` en la URL. Los archivos "subidos" viven
 * como object URLs en esta pestaña y se pierden al recargar.
 */
export class GaleriaMockBackend {
  private posts: (GalleryPost & { session_id: string; liked_by: string[] })[] = [];
  private files = new Map<string, string>();   // key → object URL
  private seq = 0;
  private config = { status: 'open' as Gallery['status'], requireApproval: false, maxUploadsPerGuest: 30 };

  constructor(private invitationId: string) {
    this.seed();
  }

  gallery(): Gallery {
    return {
      id_invitacion: this.invitationId,
      ...this.config,
      limits: {
        maxImageMB: 15,
        maxVideoMB: 100,
        maxVideoSeconds: 60,
        maxFilesPerPost: 10,
        maxUploadsPerGuest: this.config.maxUploadsPerGuest,
      },
    };
  }

  // ---------- Anfitrión ----------

  admin(): GalleryAdmin {
    const { limits, ...gallery } = this.gallery();
    const media = this.posts.flatMap((p) => p.media);
    return {
      gallery,
      stats: {
        posts: this.posts.length,
        images: media.filter((m) => m.type === 'image').length,
        videos: media.filter((m) => m.type === 'video').length,
        pending: this.posts.filter((p) => p.status === 'pending').length,
        hidden: this.posts.filter((p) => p.status === 'hidden').length,
        guests: new Set(this.posts.map((p) => p.session_id)).size,
        totalBytes: media.length * 450 * 1024,
      },
    };
  }

  updateConfig(patch: GalleryConfigPatch): Gallery {
    this.config = { ...this.config, ...patch };
    return this.gallery();
  }

  adminList(status: PostStatus | null, cursor: string | null, limit: number): PostsPage {
    let items = status ? this.posts.filter((p) => p.status === status) : this.posts;
    if (cursor) {
      const index = items.findIndex((p) => p._id === cursor);
      items = index >= 0 ? items.slice(index + 1) : [];
    }
    const page = items.slice(0, limit);
    return {
      items: page.map((p) => this.view(p, '')),
      nextCursor: items.length > limit ? page[page.length - 1]._id : null,
    };
  }

  setStatus(postId: string, status: 'visible' | 'hidden'): GalleryPost {
    const post = this.posts.find((p) => p._id === postId);
    if (!post) throw new Error('No encontramos esta publicación');
    post.status = status;
    return this.view(post, '');
  }

  adminRemove(postId: string): void {
    this.posts = this.posts.filter((p) => p._id !== postId);
  }

  uploadUrls(files: UploadFileRequest[]): UploadTarget[] {
    return files.map(() => {
      const key = `galeria/${this.invitationId}/mock-${++this.seq}`;
      return { key, uploadUrl: `mock://${key}` };
    });
  }

  /** Simula el PUT a R2 con progreso, para ver la barra funcionando. */
  async put(target: UploadTarget, body: Blob, onProgress: (loaded: number) => void): Promise<void> {
    const steps = 6;
    for (let i = 1; i <= steps; i++) {
      await new Promise((r) => setTimeout(r, 120));
      onProgress(Math.round((body.size * i) / steps));
    }
    this.files.set(target.key, URL.createObjectURL(body));
  }

  createPost(payload: CreatePostPayload): GalleryPost {
    const post = {
      _id: String(Date.now()) + (++this.seq),
      session_id: payload.session_id,
      liked_by: [] as string[],
      author: { name: payload.author_name, isMine: true },
      caption: payload.caption ?? '',
      media: payload.media.map((m) => ({
        type: m.type,
        url: this.files.get(m.key) ?? '',
        thumbUrl: this.files.get(m.thumbKey) ?? '',
        width: m.width,
        height: m.height,
        duration: m.duration,
      })),
      likes: 0,
      liked: false,
      status: (this.config.requireApproval ? 'pending' : 'visible') as PostStatus,
      createdAt: new Date().toISOString(),
    };
    this.posts.unshift(post);
    return this.view(post, payload.session_id);
  }

  list(sessionId: string, cursor: string | null, after: string | null, limit: number): PostsPage {
    let items = this.posts.filter(
      (p) => p.status === 'visible' || (p.status === 'pending' && p.session_id === sessionId),
    );
    if (after) items = items.filter((p) => p.createdAt > after);
    if (cursor) {
      const index = items.findIndex((p) => p._id === cursor);
      items = index >= 0 ? items.slice(index + 1) : [];
    }
    const page = items.slice(0, limit);
    const hasMore = !after && items.length > limit;
    return {
      items: page.map((p) => this.view(p, sessionId)),
      nextCursor: hasMore ? page[page.length - 1]._id : null,
    };
  }

  like(postId: string, sessionId: string): { likes: number; liked: boolean } {
    const post = this.posts.find((p) => p._id === postId);
    if (!post) throw new Error('No encontramos esta publicación');
    const index = post.liked_by.indexOf(sessionId);
    if (index >= 0) post.liked_by.splice(index, 1);
    else post.liked_by.push(sessionId);
    post.likes = post.liked_by.length;
    return { likes: post.likes, liked: index < 0 };
  }

  remove(postId: string, sessionId: string): void {
    const post = this.posts.find((p) => p._id === postId);
    if (!post || post.session_id !== sessionId) throw new Error('Solo puedes borrar tus publicaciones');
    this.posts = this.posts.filter((p) => p !== post);
  }

  private view(post: GaleriaMockBackend['posts'][number], sessionId: string): GalleryPost {
    const { session_id, liked_by, ...rest } = post;
    return {
      ...rest,
      author: { ...rest.author, isMine: session_id === sessionId },
      liked: liked_by.includes(sessionId),
    };
  }

  /** Publicaciones de ejemplo de otros invitados. */
  private seed(): void {
    const names = ['Tía Carmen', 'Andrés', 'Laura M.', 'Primo Juan', 'Sofi', 'Don Héctor', 'Valentina', 'Camilo'];
    const captions = ['¡Qué bonita celebración! 💕', '', 'Los mejores momentos', '', '¡Felicidades! 🎉', '', 'Me encantó la decoración', ''];
    const ratios: [number, number][] = [[4, 5], [1, 1], [3, 4], [4, 5], [16, 9], [1, 1], [4, 5], [3, 4]];
    const now = Date.now();

    for (let i = 0; i < 26; i++) {
      const [rw, rh] = ratios[i % ratios.length];
      const count = i % 5 === 0 ? 3 : 1;
      const media = Array.from({ length: count }, (_, j) => {
        const seed = `galeria-${i}-${j}`;
        const w = rw * 200;
        const h = rh * 200;
        return {
          type: 'image' as const,
          url: `https://picsum.photos/seed/${seed}/${w}/${h}`,
          thumbUrl: `https://picsum.photos/seed/${seed}/400/400`,
          width: w,
          height: h,
        };
      });
      const likedBy = Array.from({ length: (i * 7) % 23 }, (_, k) => `seed-${k}`);
      this.posts.push({
        _id: `seed-${i}`,
        session_id: `seed-author-${i % names.length}`,
        liked_by: likedBy,
        author: { name: names[i % names.length], isMine: false },
        caption: captions[i % captions.length],
        media,
        likes: likedBy.length,
        liked: false,
        status: i === 2 || i === 9 ? 'pending' : i === 5 ? 'hidden' : 'visible',
        createdAt: new Date(now - (i + 1) * 17 * 60 * 1000).toISOString(),
      });
    }
  }
}
