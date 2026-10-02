// ============================================================
// Spotify Search — Solo los campos que usamos de la API
// ============================================================

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
  external_urls: { spotify: string };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date: string;
  uri: string;
  external_urls: { spotify: string };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  explicit: boolean;
  uri: string;
  external_urls: { spotify: string };
}

export interface SpotifySearchResponse {
  success: boolean;
  data: {
    tracks: {
      items: SpotifyTrack[];
      total: number;
      limit: number;
      offset: number;
      next: string | null;
      previous: string | null;
    };
  };
}

// ============================================================
// Canción simplificada — Lo que guardamos en una solicitud
// ============================================================

export interface SongInfo {
  spotifyId: string;
  name: string;
  artists: string;          // "Selena, Marshmello" (join de nombres)
  albumName: string;
  albumImage: string;       // URL de la imagen 300x300
  duration_ms: number;
  spotifyUri: string;
  spotifyUrl: string;       // Link directo a Spotify
}

// ============================================================
// Fiesta (Party/Room)
// ============================================================

export type PartyStatus = 'active' | 'paused' | 'finished';

export interface Party {
  _id: string;
  name: string;
  code: string;             // Código corto para el link (ej: "boda-ana")
  dj_id: string;            // Referencia al DJ que la creó
  status: PartyStatus;
  config: PartyConfig;
  createdAt: string;
  updatedAt: string;
}

export interface PartyConfig {
  maxRequestsPerUser: number;   // Máx solicitudes por invitado (0 = ilimitado)
  cooldownMinutes: number;      // Tiempo entre solicitudes por usuario
  allowDuplicates: boolean;     // ¿Se puede sugerir la misma canción 2 veces?
}

export interface CreatePartyPayload {
  name: string;
  config?: Partial<PartyConfig>;
}

// ============================================================
// Sección de la fiesta
// General nace open y sin horario. El resto tiene género y horario.
// ============================================================

export type SectionStatus = 'scheduled' | 'open' | 'closed';

export interface PartySection {
  _id: string;
  party_id: string;
  genre: string;
  horario?: string;
  top_count: number;
  status: SectionStatus;
  is_general: boolean;
  winners: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSectionPayload {
  party_id: string;
  genre: string;
  horario: string;
  top_count?: number;
}

export interface UpdateSectionPayload {
  genre?: string;
  horario?: string;
  top_count?: number;
}

// ============================================================
// Solicitud de canción (Song Request)
// ============================================================

export type RequestStatus =
  | 'pending'       // Recién sugerida
  | 'queued'        // DJ la marcó como "la voy a poner"
  | 'playing'       // Sonando ahora
  | 'played'        // Ya sonó
  | 'rejected';     // Descartada por el DJ

export interface SongRequest {
  _id: string;
  party_id: string;
  section_id?: string;
  song: SongInfo;
  suggested_by: GuestInfo;
  likes: number;
  liked_by: string[];        // Array de session_ids que dieron like
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequestPayload {
  party_id: string;
  section_id: string;
  song: SongInfo;
  guest: GuestInfo;
}

export interface UpdateRequestStatusPayload {
  status: RequestStatus;
}

// ============================================================
// Invitado (Guest) — Sin login, se guarda en localStorage
// ============================================================

export interface GuestInfo {
  session_id: string;       // UUID generado al entrar, guardado en localStorage
  name: string;
  email: string;
}

export interface GuestSession extends GuestInfo {
  party_code: string;       // A qué fiesta está conectado
}

// ============================================================
// DJ (Usuario con login)
// ============================================================

export interface DjUser {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface DjLoginPayload {
  email: string;
  password: string;
}

export interface DjRegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: DjUser;
  };
}

// ============================================================
// Respuestas genéricas de la API
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

// ============================================================
// Helpers
// ============================================================

/** Convierte un SpotifyTrack en SongInfo para guardar en la solicitud */
export function trackToSongInfo(track: SpotifyTrack): SongInfo {
  const image = track.album.images.find(img => img.height === 300)
    ?? track.album.images[0];

  return {
    spotifyId: track.id,
    name: track.name,
    artists: track.artists.map(a => a.name).join(', '),
    albumName: track.album.name,
    albumImage: image?.url ?? '',
    duration_ms: track.duration_ms,
    spotifyUri: track.uri,
    spotifyUrl: track.external_urls.spotify,
  };
}

/** Se puede pedir y votar solo mientras la sección está abierta. */
export function sectionAcceptsRequests(section: PartySection): boolean {
  return section.status === 'open';
}

/** Formatea milisegundos a "3:05" */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
