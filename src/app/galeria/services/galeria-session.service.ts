import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { GalleryGuest } from '../models/galeria.models';

const GUEST_KEY = 'galeria_guest';

/**
 * Identidad del invitado en la galería. El session_id se crea en la primera visita
 * (para poder dar likes sin registrarse); el nombre se pide al publicar por primera vez.
 */
@Injectable({ providedIn: 'root' })
export class GaleriaSessionService {

  getGuest(): GalleryGuest {
    const saved = this.read();
    if (saved) return saved;
    const guest: GalleryGuest = { session_id: uuidv4(), name: '', email: '' };
    this.write(guest);
    return guest;
  }

  saveIdentity(name: string, email: string): GalleryGuest {
    const guest = { ...this.getGuest(), name: name.trim(), email: email.trim() };
    this.write(guest);
    return guest;
  }

  private read(): GalleryGuest | null {
    try {
      const raw = localStorage.getItem(GUEST_KEY);
      const parsed = raw ? (JSON.parse(raw) as GalleryGuest) : null;
      return parsed?.session_id ? parsed : null;
    } catch {
      return null;
    }
  }

  private write(guest: GalleryGuest): void {
    try {
      localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
    } catch {
      // navegación privada sin almacenamiento: la sesión vive solo en esta pestaña
    }
  }
}
