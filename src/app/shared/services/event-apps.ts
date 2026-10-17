/**
 * Puente entre las dos apps del invitado: el álbum (/invitation/galeria/:id)
 * y la música (/fiesta/:code). Cada una guarda su propia sesión; aquí solo
 * se recuerda cómo volver de una a la otra y se reaprovecha el nombre.
 */

const ALBUM_KEY = (partyCode: string) => `fiesta_album_${partyCode}`;
const GALLERY_GUEST_KEY = 'galeria_guest';
const PARTY_GUEST_KEY = 'party_guest';

export interface KnownGuest {
  name: string;
  email: string;
}

/** Link de la música que sabe a qué álbum regresar. */
export function partyUrlFromAlbum(partyCode: string, invitationId: string): { path: string[]; query: Record<string, string> } {
  return { path: ['/fiesta', partyCode], query: { album: invitationId } };
}

export function albumPath(invitationId: string): string[] {
  return ['/invitation/galeria', invitationId];
}

/** La música recuerda el álbum de la fiesta para que el botón siga ahí al recargar. */
export function rememberAlbum(partyCode: string, invitationId: string): void {
  try {
    localStorage.setItem(ALBUM_KEY(partyCode), invitationId);
  } catch {
    // sin almacenamiento: el botón vive mientras esté el ?album= en la URL
  }
}

export function rememberedAlbum(partyCode: string): string {
  try {
    return localStorage.getItem(ALBUM_KEY(partyCode)) ?? '';
  } catch {
    return '';
  }
}

/** Nombre y correo que el invitado ya dio en el álbum, para no pedirlos dos veces. */
export function guestFromAlbum(): KnownGuest | null {
  return readGuest(GALLERY_GUEST_KEY);
}

/** Nombre y correo que el invitado ya dio en la música. */
export function guestFromParty(): KnownGuest | null {
  return readGuest(PARTY_GUEST_KEY);
}

function readGuest(key: string): KnownGuest | null {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as Partial<KnownGuest>) : null;
    return parsed?.name ? { name: parsed.name, email: parsed.email ?? '' } : null;
  } catch {
    return null;
  }
}
