// ============================================================
// Galería del evento — contrato de /api/galeria
// (ver docs/prompt-backend-galeria.md)
// ============================================================

export type GalleryStatus = 'open' | 'closed';
export type PostStatus = 'visible' | 'pending' | 'hidden';
export type MediaType = 'image' | 'video';
export type UploadKind = 'image' | 'video' | 'thumb';

export interface GalleryLimits {
  maxImageMB: number;
  maxVideoMB: number;
  maxVideoSeconds: number;
  maxFilesPerPost: number;
  maxUploadsPerGuest: number;   // 0 = ilimitado
}

export interface Gallery {
  id_invitacion: string;
  status: GalleryStatus;
  requireApproval: boolean;
  maxUploadsPerGuest: number;
  limits: GalleryLimits;
  createdAt?: string;
}

export interface GalleryMedia {
  type: MediaType;
  url: string;
  thumbUrl: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface GalleryPost {
  _id: string;
  author: { name: string; isMine: boolean; email?: string };
  caption: string;
  media: GalleryMedia[];
  likes: number;
  liked: boolean;
  status: PostStatus;
  createdAt: string;
}

export interface PostsPage {
  items: GalleryPost[];
  nextCursor: string | null;
}

export interface UploadFileRequest {
  kind: UploadKind;
  contentType: string;
  size: number;
}

export interface UploadTarget {
  key: string;
  uploadUrl: string;
}

export interface CreatePostMedia {
  key: string;
  thumbKey: string;
  type: MediaType;
  width: number;
  height: number;
  duration?: number;
}

export interface CreatePostPayload {
  session_id: string;
  author_name: string;
  author_email?: string;
  caption?: string;
  media: CreatePostMedia[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** Invitado: sin login, se identifica con un uuid guardado en el navegador. */
export interface GalleryGuest {
  session_id: string;
  name: string;
  email: string;
}

/** Archivo ya preparado en el navegador, listo para subir. */
export interface PreparedMedia {
  type: MediaType;
  file: Blob;          // principal (foto comprimida o video original)
  contentType: string;
  thumb: Blob;
  thumbType: string;
  previewUrl: string;  // object URL de la miniatura, para la vista previa
  width: number;
  height: number;
  duration?: number;
}

// ============================================================
// Anfitrión (header X-Host-Token)
// ============================================================

export interface GalleryStats {
  posts: number;
  images: number;
  videos: number;
  pending: number;
  hidden: number;
  guests: number;
  totalBytes: number;
}

export interface GalleryAdmin {
  gallery: Omit<Gallery, 'limits'>;
  stats: GalleryStats;
}

export interface GalleryConfigPatch {
  status?: GalleryStatus;
  requireApproval?: boolean;
  maxUploadsPerGuest?: number;
}
