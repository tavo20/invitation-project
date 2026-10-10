import { Injectable } from '@angular/core';
import { GalleryLimits, PreparedMedia } from '../models/galeria.models';

const MAIN_MAX_SIDE = 2000;
const THUMB_MAX_SIDE = 400;
const MB = 1024 * 1024;

const VIDEO_TYPE_BY_EXT: Record<string, string> = {
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
};

/**
 * Prepara en el navegador lo que se va a subir:
 * - Fotos: se redimensionan a 2000px y se convierten a WebP (o JPEG si el navegador no sabe WebP).
 * - Videos: se suben tal cual; se lee duración y tamaño y se saca un cuadro como portada.
 * - Ambos llevan una miniatura de 400px para la cuadrícula.
 */
@Injectable({ providedIn: 'root' })
export class MediaProcessingService {

  async prepare(file: File, limits: GalleryLimits): Promise<PreparedMedia> {
    if (this.isVideo(file)) return this.prepareVideo(file, limits);
    if (file.type.startsWith('image/')) return this.prepareImage(file, limits);
    throw new Error(`"${file.name}" no es una foto ni un video`);
  }

  private isVideo(file: File): boolean {
    return file.type.startsWith('video/') || !!VIDEO_TYPE_BY_EXT[this.ext(file.name)];
  }

  private ext(name: string): string {
    return (name.split('.').pop() || '').toLowerCase();
  }

  // ---------- Fotos ----------

  private async prepareImage(file: File, limits: GalleryLimits): Promise<PreparedMedia> {
    let bitmap: ImageBitmap | HTMLImageElement;
    try {
      bitmap = await this.decodeImage(file);
    } catch {
      // típico de HEIC en Chrome/Android: el navegador no sabe leerlo
      throw new Error(`No pudimos leer "${file.name}". Prueba con una foto JPG o PNG.`);
    }

    const width = bitmap.width;
    const height = bitmap.height;
    const main = await this.encode(bitmap, MAIN_MAX_SIDE, 0.85);
    const thumb = await this.encode(bitmap, THUMB_MAX_SIDE, 0.75);
    if ('close' in bitmap) bitmap.close();

    if (main.blob.size > limits.maxImageMB * MB) {
      throw new Error(`"${file.name}" pesa demasiado (máx. ${limits.maxImageMB} MB)`);
    }

    return {
      type: 'image',
      file: main.blob,
      contentType: main.blob.type,
      thumb: thumb.blob,
      thumbType: thumb.blob.type,
      previewUrl: URL.createObjectURL(thumb.blob),
      width: main.width,
      height: main.height,
    };
  }

  private async decodeImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
    if ('createImageBitmap' in window) {
      try {
        // respeta la orientación EXIF de las fotos del celular
        return await createImageBitmap(file, { imageOrientation: 'from-image' });
      } catch {
        // Safari viejo no acepta opciones: se intenta con <img>
      }
    }
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  // ---------- Videos ----------

  private async prepareVideo(file: File, limits: GalleryLimits): Promise<PreparedMedia> {
    const contentType = this.videoContentType(file);
    if (!contentType) {
      throw new Error(`"${file.name}" tiene un formato de video que no aceptamos. Usa MP4 o MOV.`);
    }
    if (file.size > limits.maxVideoMB * MB) {
      throw new Error(`"${file.name}" pesa demasiado (máx. ${limits.maxVideoMB} MB)`);
    }

    const info = await this.readVideo(file);
    if (info.duration !== undefined && info.duration > limits.maxVideoSeconds) {
      throw new Error(`"${file.name}" dura ${Math.round(info.duration)} s (máx. ${limits.maxVideoSeconds} s)`);
    }

    // si este navegador no pudo sacar un cuadro (p. ej. HEVC en Chrome), va una portada genérica
    const thumb = info.frame ?? (await this.placeholderThumb(info.width, info.height));

    return {
      type: 'video',
      file,
      contentType,
      thumb,
      thumbType: thumb.type,
      previewUrl: URL.createObjectURL(thumb),
      width: info.width,
      height: info.height,
      ...(info.duration !== undefined ? { duration: info.duration } : {}),
    };
  }

  /** Normaliza el tipo a los que acepta el backend: video/mp4, video/quicktime o video/webm. */
  private videoContentType(file: File): string | null {
    const type = file.type.toLowerCase();
    if (type === 'video/mp4' || type === 'video/quicktime' || type === 'video/webm') return type;
    if (type === 'video/x-m4v') return 'video/mp4';
    return VIDEO_TYPE_BY_EXT[this.ext(file.name)] ?? null;
  }

  /**
   * Lee duración, tamaño y un cuadro de portada. Nunca falla: si el navegador no sabe
   * decodificar el video, devuelve lo que pudo y el archivo se sube igual.
   */
  private async readVideo(file: File): Promise<{ width: number; height: number; duration?: number; frame?: Blob }> {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.preload = 'auto';
    video.src = url;

    const result: { width: number; height: number; duration?: number; frame?: Blob } = { width: 1080, height: 1920 };
    try {
      // iOS no dispara loadeddata sin reproducir; loadedmetadata sí
      await this.waitFor(video, 'loadedmetadata', 10000);
      if (isFinite(video.duration) && video.duration > 0) {
        result.duration = Math.round(video.duration * 10) / 10;
      }
      if (video.videoWidth && video.videoHeight) {
        result.width = video.videoWidth;
        result.height = video.videoHeight;
      }

      // un cuadro cerca del inicio como portada (el primer cuadro suele salir negro)
      video.currentTime = Math.min(1, (result.duration ?? 3) / 3);
      await this.waitFor(video, 'seeked', 5000);
      if (video.readyState >= 2 && video.videoWidth) {
        result.frame = (await this.encode(video, THUMB_MAX_SIDE, 0.75, result.width, result.height)).blob;
      }
    } catch {
      // sin metadatos o sin cuadro: se sigue con lo que haya
    } finally {
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(url);
    }
    return result;
  }

  /** Portada genérica (degradado + ícono de play) con la proporción del video. */
  private async placeholderThumb(width: number, height: number): Promise<Blob> {
    const scale = THUMB_MAX_SIDE / Math.max(width, height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas no disponible');

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#3a302a');
    gradient.addColorStop(1, '#8a7566');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const r = Math.min(canvas.width, canvas.height) * 0.14;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.6, cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx - r * 0.6, cy + r);
    ctx.closePath();
    ctx.fill();

    let blob = await this.toBlob(canvas, 'image/webp', 0.8);
    if (!blob || blob.type !== 'image/webp') blob = await this.toBlob(canvas, 'image/jpeg', 0.8);
    if (!blob) throw new Error('no se pudo crear la portada');
    return blob;
  }

  private waitFor(el: HTMLMediaElement, event: string, timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`timeout ${event}`));
      }, timeoutMs);
      const onOk = () => { cleanup(); resolve(); };
      const onError = () => { cleanup(); reject(new Error('error')); };
      const cleanup = () => {
        clearTimeout(timer);
        el.removeEventListener(event, onOk);
        el.removeEventListener('error', onError);
      };
      el.addEventListener(event, onOk, { once: true });
      el.addEventListener('error', onError, { once: true });
    });
  }

  // ---------- Canvas ----------

  /** Dibuja la fuente reducida a `maxSide` y la exporta a WebP (o JPEG como respaldo). */
  private async encode(
    source: CanvasImageSource,
    maxSide: number,
    quality: number,
    srcWidth?: number,
    srcHeight?: number,
  ): Promise<{ blob: Blob; width: number; height: number }> {
    const w = srcWidth ?? (source as { width: number }).width;
    const h = srcHeight ?? (source as { height: number }).height;
    const scale = Math.min(1, maxSide / Math.max(w, h));
    const width = Math.max(1, Math.round(w * scale));
    const height = Math.max(1, Math.round(h * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas no disponible');
    ctx.drawImage(source, 0, 0, width, height);

    let blob = await this.toBlob(canvas, 'image/webp', quality);
    // Safari viejo ignora WebP y devuelve PNG: en ese caso, JPEG
    if (!blob || blob.type !== 'image/webp') {
      blob = await this.toBlob(canvas, 'image/jpeg', quality);
    }
    if (!blob) throw new Error('no se pudo exportar la imagen');
    return { blob, width, height };
  }

  private toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  }
}
