import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

const DJ_TOKEN_KEY = 'dj_token';
const LINK_KEY = (partyCode: string) => `party_dj_${partyCode}`;

/**
 * Credenciales del panel del DJ: la sesión de un DJ con cuenta (dj_token)
 * o el link de una sola fiesta (/dj/<code>?token=...), que llega una vez y se guarda aquí.
 */
@Injectable({ providedIn: 'root' })
export class DjAccessService {
  private linkToken = '';

  /** Toma el token del link si viene en la URL; si no, el que quedó guardado para esta fiesta. */
  useLink(partyCode: string, fromUrl: string | null): string {
    if (fromUrl) {
      try {
        localStorage.setItem(LINK_KEY(partyCode), fromUrl);
      } catch {
        // sin almacenamiento: el link sirve mientras esta pestaña esté abierta
      }
      this.linkToken = fromUrl;
      return fromUrl;
    }
    try {
      this.linkToken = localStorage.getItem(LINK_KEY(partyCode)) ?? '';
    } catch {
      this.linkToken = '';
    }
    return this.linkToken;
  }

  forgetLink(partyCode: string): void {
    this.linkToken = '';
    try {
      localStorage.removeItem(LINK_KEY(partyCode));
    } catch {
      // nada que limpiar
    }
  }

  hasAccount(): boolean {
    try {
      return !!localStorage.getItem(DJ_TOKEN_KEY);
    } catch {
      return false;
    }
  }

  headers(): HttpHeaders {
    let headers = new HttpHeaders();
    try {
      const token = localStorage.getItem(DJ_TOKEN_KEY);
      if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    } catch {
      // sin almacenamiento no hay sesión de DJ
    }
    if (this.linkToken) headers = headers.set('x-party-token', this.linkToken);
    return headers;
  }
}
