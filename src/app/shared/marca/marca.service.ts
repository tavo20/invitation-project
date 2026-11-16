import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Marca que se muestra al cliente final. Si no es marca blanca, se muestra InvitApp. */
export interface Marca {
  marcaBlanca: boolean;
  nombre: string;
  img: string | null;
  slug?: string | null;
}

export const SIN_MARCA: Marca = { marcaBlanca: false, nombre: '', img: null, slug: null };

/** Texto de marca para títulos y archivos: la del planner si es marca blanca, si no InvitApp. */
export const nombreDeMarca = (m: Marca | null | undefined): string =>
  m?.marcaBlanca && m.nombre ? m.nombre : 'InvitApp';

@Injectable({ providedIn: 'root' })
export class MarcaService {
  private readonly API = `${environment.apiUrl}api/marca`;
  private cache = new Map<string, Promise<Marca>>();

  constructor(private http: HttpClient) {}

  porSlug(slug: string): Promise<Marca> {
    return this.cargar(`s:${slug}`, `${this.API}/cliente/${encodeURIComponent(slug)}`);
  }

  porEvento(idInvitacion: string): Promise<Marca> {
    return this.cargar(`e:${idInvitacion}`, `${this.API}/evento/${encodeURIComponent(idInvitacion)}`);
  }

  private cargar(key: string, url: string): Promise<Marca> {
    if (!this.cache.has(key)) {
      const p = lastValueFrom(this.http.get<{ success: boolean; data: Marca }>(url))
        .then(r => (r?.success && r.data ? r.data : SIN_MARCA))
        .catch(() => SIN_MARCA);
      this.cache.set(key, p);
    }
    return this.cache.get(key)!;
  }
}
