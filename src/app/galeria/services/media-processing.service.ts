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
    if (file.size > limits.maxVideoMB * MB) {
      throw new Error(`"${file.name}" pesa demasiado (máx. ${limits.maxVideoMB} MB)`);
    }

    const contentType = file.type || VIDEO_TYPE_BY_EXT[this.ext(file.name)] || 'video/mp4';
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = url;

    try {
      await this.waitFor(video, 'loadeddata', 15000);
      const duration = Math.round(video.duration * 10) / 10;
      if (!isFinite(duration)) throw new Error('sin duración');
      if (duration > limits.maxVideoSeconds) {
        throw new Error(`"${file.name}" dura ${Math.round(duration)} s (máx. ${limits.maxVideoSeconds} s)`);
      }

      // un cuadro cerca del inicio como portada (el primer cuadro suele salir negro)
      video.currentTime = Math.min(1, duration / 3);
      await this.waitFor(video, 'seeked', 5000).catch(() => undefined);

      const width = video.videoWidth || 1080;
      const height = video.videoHeight || 1920;
      const thumb = await this.encode(video, THUMB_MAX_SIDE, 0.75, width, height);

      return {
        type: 'video',
        file,
        contentType,
        thumb: thumb.blob,
        thumbType: thumb.blob.type,
        previewUrl: URL.createObjectURL(thumb.blob),
        width,
        height,
        duration,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('máx.')) throw error;
      throw new Error(`No pudimos leer el video "${file.name}". Prueba con un MP4.`);
    } finally {
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(url);
    }
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
