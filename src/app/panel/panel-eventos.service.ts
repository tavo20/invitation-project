import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PanelAuthService } from './panel-auth.service';
import {
  ActualizarEvento, NuevoEvento, PanelApiResponse, PanelCatalogo, PanelConfirmacion, PanelEventoCard, PanelEventoCreado,
  PanelEventoDetalle, PanelEventosResponse, PanelLinks, PanelMesa,
} from './panel.models';

const enDias = (d: number) => new Date(Date.now() + d * 86400000).toISOString();
const BASE = 'https://www.invitapp.art';
const espera = <T>(v: T, ms = 350) => new Promise<T>(r => setTimeout(() => r(structuredClone(v)), ms));

/** Eventos de ejemplo para el modo de prueba (?mock=1). */
const MOCK_EVENTOS: PanelEventoCard[] = [
  {
    _id: 'm1', id_invitacion: 'valentina-andres-k7m4p2xq', nombre: 'Valentina & Andrés', tipo: 'boda',
    fecha: enDias(24), lugar: 'Hacienda La Quinta, Melgar',
    modulos: { invitacion: true, galeria: true, musica: true }, plantilla: 'neblina', estado: 'activo',
    cobro: { plan: 'completa', precio: 390000, estado: 'pendiente' },
    confirmaciones: { confirmados: 142, pendientes: 12, cancelados: 6, respuestas: 81 }, createdAt: enDias(-40),
  },
  {
    _id: 'm2', id_invitacion: 'mis-xv-sofia-a8d2k1pq', nombre: 'Mis XV · Sofía', tipo: 'xv',
    fecha: enDias(67), lugar: 'Club El Nogal, Bogotá',
    modulos: { invitacion: true, galeria: false, musica: false }, plantilla: 'xyz', estado: 'activo',
    cobro: { plan: 'invitacion', precio: 239000, estado: 'pagado' },
    confirmaciones: { confirmados: 38, pendientes: 4, cancelados: 1, respuestas: 22 }, createdAt: enDias(-10),
  },
  {
    _id: 'm4', id_invitacion: 'laura-felipe-q8w3e7rt', nombre: 'Laura & Felipe', tipo: 'boda',
    fecha: enDias(41), lugar: 'Finca Los Arrayanes, La Calera',
    modulos: { invitacion: false, galeria: true, musica: true }, plantilla: null, estado: 'activo',
    cobro: { plan: 'fiesta', precio: 299000, estado: 'pendiente' },
    confirmaciones: { confirmados: 0, pendientes: 0, cancelados: 0, respuestas: 0 }, createdAt: enDias(-3),
  },
  {
    _id: 'm3', id_invitacion: 'camila-juan-p2x9w4re', nombre: 'Camila & Juan', tipo: 'boda',
    fecha: enDias(-12), lugar: 'Casa Medina, Villa de Leyva',
    modulos: { invitacion: true, galeria: true, musica: true }, plantilla: 'neblina', estado: 'activo',
    cobro: { plan: 'completa', precio: 390000, estado: 'pagado' },
    confirmaciones: { confirmados: 186, pendientes: 0, cancelados: 9, respuestas: 98 }, createdAt: enDias(-120),
  },
];

const MOCK_CATALOGO: PanelCatalogo = {
  plantillas: [
    { key: 'neblina', nombre: 'Neblina', descripcion: 'Romántica y suave, con paletas de color y canción propia.' },
    { key: 'xyz', nombre: 'Flow', descripcion: 'Moderna, con sobre animado de entrada y cuenta regresiva.' },
  ],
  precios: { invitacion: 130000, fiesta: 299000, completa: 390000 },
  tipos: ['boda', 'xv', 'cumpleanos', 'bautizo', 'otro'],
};

export const mockLinks = (id: string, slug: string, conExperiencia: boolean, conInvitacion = true): PanelLinks => ({
  novios: `${BASE}/invitation/delivery/${id}?k=ejemplo-no-funciona`,
  ...(conInvitacion ? {
    confirmacion: `${BASE}/invitation/confirmation/${id}`,
    listaConfirmaciones: `${BASE}/invitation/confirmations/list/${id}`,
    mesas: `${BASE}/invitation/mesas/${id}`,
    invitacion: `${BASE}/${slug}`,
    entrega: `${BASE}/invitation/delivery/${id}`,
    editarInvitacion: `${BASE}/invitation/editar/${id}?token=ejemplo-no-funciona`,
  } : {}),
  ...(conExperiencia ? {
    galeria: `${BASE}/invitation/galeria/${id}`,
    galeriaAdmin: `${BASE}/invitation/galeria/${id}/admin?token=ejemplo-no-funciona`,
    musica: `${BASE}/fiesta/${slug}-x7k2m9`,
    dj: `${BASE}/dj/${slug}-x7k2m9?token=ejemplo-no-funciona`,
  } : {}),
});

const MOCK_NOMBRES = ['Familia Rodríguez', 'Laura Gómez', 'Tía Marta y Jorge', 'Camilo Restrepo', 'Familia Pérez Díaz', 'Sofía y Daniel',
  'Andrea Martínez', 'Los Ospina', 'Juliana Torres', 'Carlos y Ana', 'Mateo Herrera', 'Familia Duarte'];

const mockDetalle = (e: PanelEventoCard): PanelEventoDetalle => {
  const mesas: PanelMesa[] = Array.from({ length: 8 }, (_, i) => ({ _id: `mesa${i + 1}`, name: `Mesa ${i + 1}`, capacity: 10, ocupados: 0 }));
  const estados: PanelConfirmacion['status'][] = ['confirmado', 'confirmado', 'confirmado', 'pendiente', 'confirmado', 'cancelada'];
  const lista: PanelConfirmacion[] = MOCK_NOMBRES.map((names, i) => {
    const status = estados[i % estados.length];
    const mesa = status === 'confirmado' && i < 9 ? mesas[i % 6] : null;
    const n = status === 'cancelada' ? 0 : (i % 4) + 1;
    if (mesa) mesa.ocupados += n;
    return {
      _id: `c${i}`, names, numero_confirmados: n, status, mesa_id: mesa?._id || null,
      descripcion: i === 2 ? 'Vamos con mucha ilusión. ¡Felicidades!' : i === 4 ? 'Uno de nosotros es vegetariano' : '',
      createdAt: enDias(-i * 2),
    };
  });
  const slug = e.id_invitacion.replace(/-[a-z0-9]{8}$/, '');
  const conInv = e.modulos.invitacion;
  return { ...e, links: mockLinks(e.id_invitacion, slug, e.modulos.galeria, conInv), lista: conInv ? lista : [], mesas: conInv ? mesas : [] };
};

const slugify = (v: string) =>
  v.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'evento';

@Injectable({ providedIn: 'root' })
export class PanelEventosService {
  constructor(private http: HttpClient, private auth: PanelAuthService) {}

  listar(): Promise<PanelEventosResponse> {
    if (this.auth.isMock) {
      const porPagar = MOCK_EVENTOS.filter(e => e.cobro.estado === 'pendiente').reduce((t, e) => t + e.cobro.precio, 0);
      return espera({ eventos: MOCK_EVENTOS, cuenta: { eventos: MOCK_EVENTOS.length, porPagar } });
    }
    return this.auth.request(
      this.http.get<PanelApiResponse<PanelEventosResponse>>(`${this.auth.API}/eventos`, this.auth.authHeaders()),
    );
  }

  catalogo(): Promise<PanelCatalogo> {
    if (this.auth.isMock) return espera(MOCK_CATALOGO, 200);
    return this.auth.request(
      this.http.get<PanelApiResponse<PanelCatalogo>>(`${this.auth.API}/catalogo`, this.auth.authHeaders()),
    );
  }

  crear(body: NuevoEvento): Promise<PanelEventoCreado> {
    if (this.auth.isMock) {
      const slug = slugify(body.nombre);
      const id = `${slug}-m0ck1d0x`;
      const inv = body.paquete !== 'fiesta';
      const fiesta = body.paquete !== 'invitacion';
      const evento: PanelEventoCreado = {
        _id: `m${Date.now()}`, id_invitacion: id, nombre: body.nombre, tipo: body.tipo, fecha: body.fecha, lugar: body.lugar,
        modulos: { invitacion: inv, galeria: fiesta, musica: fiesta }, plantilla: inv ? body.plantilla : null,
        estado: 'activo',
        cobro: { plan: body.paquete, precio: MOCK_CATALOGO.precios[body.paquete], estado: 'pendiente' },
        confirmaciones: { confirmados: 0, pendientes: 0, cancelados: 0, respuestas: 0 },
        createdAt: new Date().toISOString(),
        links: mockLinks(id, slug, fiesta, inv),
      };
      MOCK_EVENTOS.unshift(evento);
      return espera(evento, 900);
    }
    return this.auth.request(
      this.http.post<PanelApiResponse<PanelEventoCreado>>(`${this.auth.API}/eventos`, body, this.auth.authHeaders()),
    );
  }

  detalle(id: string): Promise<PanelEventoDetalle> {
    if (this.auth.isMock) {
      const e = MOCK_EVENTOS.find(x => x._id === id);
      return e ? espera(mockDetalle(e)) : Promise.reject(new Error('No encontramos este evento'));
    }
    return this.auth
      .request(this.http.get<PanelApiResponse<PanelEventoDetalle & { confirmaciones: any }>>(`${this.auth.API}/eventos/${encodeURIComponent(id)}`, this.auth.authHeaders()))
      .then(d => this.normalizar(d));
  }

  activarExperiencia(id: string): Promise<PanelEventoCard & { links: PanelLinks }> {
    if (this.auth.isMock) {
      const e = MOCK_EVENTOS.find(x => x._id === id)!;
      e.modulos = { invitacion: true, galeria: true, musica: true };
      e.cobro = { ...e.cobro, plan: 'completa', precio: e.cobro.estado === 'pendiente' ? MOCK_CATALOGO.precios.completa : e.cobro.precio };
      return espera({ ...e, links: mockDetalle(e).links }, 900);
    }
    return this.auth.request(
      this.http.post<PanelApiResponse<PanelEventoCard & { links: PanelLinks }>>(
        `${this.auth.API}/eventos/${encodeURIComponent(id)}/experiencia`, {}, this.auth.authHeaders()),
    );
  }

  agregarInvitacion(id: string, plantilla: string, nombres: { a: string; b: string }): Promise<PanelEventoCard & { links: PanelLinks }> {
    if (this.auth.isMock) {
      const e = MOCK_EVENTOS.find(x => x._id === id)!;
      e.modulos = { invitacion: true, galeria: true, musica: true };
      e.plantilla = plantilla;
      e.cobro = { ...e.cobro, plan: 'completa', precio: e.cobro.estado === 'pendiente' ? MOCK_CATALOGO.precios.completa : e.cobro.precio };
      return espera({ ...e, links: mockDetalle(e).links }, 900);
    }
    return this.auth.request(
      this.http.post<PanelApiResponse<PanelEventoCard & { links: PanelLinks }>>(
        `${this.auth.API}/eventos/${encodeURIComponent(id)}/invitacion`, { plantilla, nombres }, this.auth.authHeaders()),
    );
  }

  actualizar(id: string, body: ActualizarEvento): Promise<PanelEventoCard> {
    if (this.auth.isMock) {
      const e = MOCK_EVENTOS.find(x => x._id === id)!;
      Object.assign(e, body);
      return espera(e, 400);
    }
    return this.auth.request(
      this.http.put<PanelApiResponse<PanelEventoCard>>(`${this.auth.API}/eventos/${encodeURIComponent(id)}`, body, this.auth.authHeaders()),
    );
  }

  /** El back manda el resumen en `confirmaciones` y la lista aparte; aquí se separan para no mezclarlos. */
  private normalizar(d: any): PanelEventoDetalle {
    const lista: PanelConfirmacion[] = Array.isArray(d.confirmaciones) ? d.confirmaciones : d.lista || [];
    const resumen = Array.isArray(d.confirmaciones) ? d.resumen || null : d.confirmaciones;
    return { ...d, lista, confirmaciones: resumen };
  }
}
