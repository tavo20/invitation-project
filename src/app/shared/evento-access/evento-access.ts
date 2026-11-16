/**
 * Llave del link de los novios, guardada en este navegador por evento.
 * El link llega como /invitation/delivery/<id>?k=<llave>: la llave se guarda aquí y se quita de la URL.
 */
const KEY = (id: string) => `invitapp_novios_${id}`;
const PANEL_SESSION = 'invitapp_panel_session';

let eventoActivo: string | null = null;

const get = (k: string): string | null => {
  try { return localStorage.getItem(k); } catch { return null; }
};

export const guardarLlave = (idInvitacion: string, llave: string): void => {
  try { localStorage.setItem(KEY(idInvitacion), llave); } catch { /* sin almacenamiento: solo dura esta visita */ }
  memoria[idInvitacion] = llave;
};

export const borrarLlave = (idInvitacion: string): void => {
  try { localStorage.removeItem(KEY(idInvitacion)); } catch { /* nada */ }
  delete memoria[idInvitacion];
};

const memoria: Record<string, string> = {};

export const llaveDe = (idInvitacion: string): string | null => memoria[idInvitacion] || get(KEY(idInvitacion));

/** Las pantallas de un evento (lista, mesas) lo marcan como activo para que sus peticiones lleven la llave. */
export const activarEvento = (idInvitacion: string | null): void => {
  eventoActivo = idInvitacion;
};

/** Headers de acceso al evento activo: llave de novios y/o sesión del panel del organizador. */
export const headersDeAcceso = (): Record<string, string> => {
  const h: Record<string, string> = {};
  const llave = eventoActivo ? llaveDe(eventoActivo) : null;
  if (llave) h['x-evento-key'] = llave;
  try {
    const s = JSON.parse(get(PANEL_SESSION) || 'null');
    if (s?.token && s.token !== 'mock') h['Authorization'] = `Bearer ${s.token}`;
  } catch { /* sesión dañada: se ignora */ }
  return h;
};
