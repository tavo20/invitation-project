/**
 * Puente entre las dos apps del invitado: el álbum (/invitation/galeria/:id)
 * y la música (/fiesta/:code). Quedan enlazadas porque la fiesta guarda el
 * id de la invitación. Cada una tiene su propia sesión; aquí se reaprovecha el nombre.
 */

const GALLERY_GUEST_KEY = 'galeria_guest';
const PARTY_GUEST_KEY = 'party_guest';

export interface KnownGuest {
  name: string;
  email: string;
}

export function albumPath(invitationId: string): string[] {
  return ['/invitation/galeria', invitationId];
}

export function partyPath(partyCode: string): string[] {
  return ['/fiesta', partyCode];
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

/**
 * Pinta la barra del navegador del celular y el fondo de la página (el que se ve
 * al estirar el scroll) con el color de la app. Devuelve cómo dejarlo como estaba.
 */
export function applyAppChrome(color: string): () => void {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const created = !meta;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  const previousMeta = meta.content;
  const previousBg = document.body.style.background;
  meta.content = color;
  document.body.style.background = color;

  return () => {
    // si la otra app ya pintó su color (al cambiar de app), no se pisa
    if (meta.content !== color) return;
    if (created) meta.remove();
    else meta.content = previousMeta;
    document.body.style.background = previousBg;
  };
}
