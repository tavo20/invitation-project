export interface PanelCliente {
  _id: string;
  nombre: string;
  marca?: string;
  email: string;
  img?: string;
  slug?: string | null;
  marcaBlanca?: boolean;
  /** Cliente de la demo pública: sin contraseña y se restaura cada noche. */
  demo?: boolean;
  mustChangePassword: boolean;
}

export interface PanelSession {
  token: string;
  cliente: PanelCliente;
}

export interface PanelApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type TipoEvento = 'boda' | 'xv' | 'cumpleanos' | 'bautizo' | 'otro';
export type PlanEvento = 'invitacion' | 'fiesta' | 'completa';
export type EstadoCobro = 'pendiente' | 'pagado' | 'cortesia';

export interface ResumenConfirmaciones {
  confirmados: number;
  pendientes: number;
  cancelados: number;
  respuestas: number;
}

export interface PanelEventoCard {
  _id: string;
  id_invitacion: string;
  nombre: string;
  tipo: TipoEvento;
  fecha: string | null;
  lugar: string;
  modulos: { invitacion: boolean; galeria: boolean; musica: boolean };
  plantilla: string | null;
  estado: 'activo' | 'archivado';
  cobro: { plan: PlanEvento; precio: number; estado: EstadoCobro; pagadoEn?: string | null; promocion?: string };
  confirmaciones: ResumenConfirmaciones | null;
  createdAt: string;
}

export interface PanelEventosResponse {
  eventos: PanelEventoCard[];
  cuenta: { eventos: number; porPagar: number };
}

export interface PanelPlantilla {
  key: string;
  nombre: string;
  descripcion: string;
}

export interface PanelCatalogo {
  plantillas: PanelPlantilla[];
  precios: Record<PlanEvento, number>;
  tipos: TipoEvento[];
}

/** Links del evento. Los privados pueden venir en null si no se pudieron descifrar. */
export interface PanelLinks {
  /** Link único de los novios: su página con todo el evento. */
  novios?: string | null;
  confirmacion?: string;
  listaConfirmaciones?: string;
  mesas?: string;
  invitacion?: string;
  entrega?: string;
  editarInvitacion?: string | null;
  galeria?: string;
  galeriaAdmin?: string | null;
  musica?: string;
  dj?: string | null;
}

export interface NuevoEvento {
  nombre: string;
  tipo: TipoEvento;
  fecha: string | null;
  lugar: string;
  nombres: { a: string; b: string };
  plantilla: string;
  paquete: PlanEvento;
}

export type PanelEventoCreado = PanelEventoCard & { links: PanelLinks };

export type EstadoConfirmacion = 'confirmado' | 'pendiente' | 'cancelada';

export interface PanelConfirmacion {
  _id: string;
  names: string;
  numero_confirmados: number;
  status: EstadoConfirmacion;
  descripcion?: string;
  type?: 'confirmacion' | 'hospedaje';
  mesa_id?: string | null;
  createdAt: string;
}

export interface PanelMesa {
  _id: string;
  name: string;
  capacity: number;
  ocupados: number;
}

export type PanelEventoDetalle = PanelEventoCard & {
  links: PanelLinks;
  confirmaciones: ResumenConfirmaciones | null;
  lista: PanelConfirmacion[];
  mesas: PanelMesa[];
};

export interface ActualizarEvento {
  nombre?: string;
  fecha?: string | null;
  lugar?: string;
  estado?: 'activo' | 'archivado';
}
