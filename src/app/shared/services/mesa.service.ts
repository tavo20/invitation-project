import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Mesa {
  _id: string;
  id_invitacion: string;
  name: string;
  capacity: number;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

interface MesaApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class MesaService {
  private readonly API = `${environment.apiUrl}api/mesa`;

  constructor(private http: HttpClient) {}

  async getByInvitation(invitationId: string): Promise<Mesa[]> {
    const response = await lastValueFrom(
      this.http.get<MesaApiResponse<Mesa[]>>(`${this.API}/by-invitation/${invitationId}`)
    );
    if (!response.success) {
      throw new Error(response.message || 'No se pudieron cargar las mesas');
    }
    return Array.isArray(response.data) ? response.data : [];
  }

  async create(payload: {
    id_invitacion: string;
    name: string;
    capacity: number;
    order?: number;
  }): Promise<Mesa> {
    const response = await lastValueFrom(
      this.http.post<MesaApiResponse<Mesa>>(`${this.API}/create`, payload)
    );
    if (!response.success) {
      throw new Error(response.message || 'No se pudo crear la mesa');
    }
    return response.data;
  }

  async update(
    mesaId: string,
    payload: { name?: string; capacity?: number; order?: number }
  ): Promise<Mesa> {
    const response = await lastValueFrom(
      this.http.put<MesaApiResponse<Mesa>>(`${this.API}/${mesaId}`, payload)
    );
    if (!response.success) {
      throw new Error(response.message || 'No se pudo actualizar la mesa');
    }
    return response.data;
  }

  async delete(mesaId: string): Promise<void> {
    const response = await lastValueFrom(
      this.http.delete<MesaApiResponse<unknown>>(`${this.API}/${mesaId}`)
    );
    if (!response.success) {
      throw new Error(response.message || 'No se pudo eliminar la mesa');
    }
  }
}
