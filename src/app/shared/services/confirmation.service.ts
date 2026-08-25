import { Injectable } from '@angular/core';
import { MainService } from './main.service';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface ConfirmationPayload {
  invitationId: string | number | null;
  invitationSlug: string | null;
  guestsCount: number;
  names: string;
  comment: string;
  timestamp: string;
  type?: 'confirmacion' | 'hospedaje';
  status?: 'pending' | 'confirmed' | 'cancelled' | 'confirmado';
}

/** Documento tal como viene de Mongo / el backend. */
export interface ConfirmationDocument {
  _id: string;
  names: string;
  type: string;
  status: string;
  id_invitacion: string;
  numero_confirmados: number;
  descripcion?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface ConfirmationApiSuccess<T = ConfirmationDocument> {
  success: true;
  data: T;
}

export interface ConfirmationApiError {
  success: false;
  message: string;
  error?: unknown;
}

export type ConfirmationApiResponse<T = ConfirmationDocument> =
  | ConfirmationApiSuccess<T>
  | ConfirmationApiError;

export interface ConfirmationInviteContext {
  id: string | number | null;
  slug: string | null;
  data: any;
  theme?: string;
  typeConfirmation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private readonly BACKEND_URL = environment.apiUrl;
  private readonly PATH = 'api/invitation-confirmation';

  constructor(private main: MainService, private http: HttpClient) {}

  /** Resuelve la invitación por id o slug para la pantalla de confirmación. */
  async getInvitationContext(param: string): Promise<ConfirmationInviteContext | null> {
    const record =
      (await this.main.getDataById({ id: param })) ??
      this.main.getDataBySlug({ slug: param });

    if (!record) return null;

    return {
      id: record.id ?? null,
      slug: record.slug ?? null,
      data: record.data ?? null,
      theme: record.data?.confirmationTheme ?? record.data?.confirmation?.theme ?? null,
      typeConfirmation: record.data?.typeConfirmation ?? ''
    };
  }

  /** Guarda la confirmación en el backend. */
  async submitConfirmation(
    payload: Omit<ConfirmationPayload, 'timestamp'>
  ): Promise<boolean> {
    const confirmation: ConfirmationPayload = {
      ...payload,
      timestamp: new Date().toISOString(),
      type: 'confirmacion'
    };

    const response = await lastValueFrom(
      this.http.post<ConfirmationApiResponse>(
        `${this.BACKEND_URL}${this.PATH}/create`,
        confirmation
      )
    );

    if (response.success) {
      return response.success;
    }

    throw new Error(response.message || 'Failed to save confirmation');
  }

  /** Lista confirmaciones por id de invitación. */
  async getConfirmationsByInvitation(
    invitationId: string
  ): Promise<ConfirmationDocument[]> {
    const response = await lastValueFrom(
      this.http.get<ConfirmationApiResponse<ConfirmationDocument[]>>(
        `${this.BACKEND_URL}${this.PATH}/all-by-invitation/${invitationId}`
      )
    );

    if (response.success) {
      return Array.isArray(response.data) ? response.data : [];
    }

    throw new Error(response.message || 'Failed to load confirmations');
  }

  /** Elimina una confirmación por su _id. */
  async deleteConfirmation(confirmationId: string): Promise<boolean> {
    const response = await lastValueFrom(
      this.http.put<ConfirmationApiResponse>(
        `${this.BACKEND_URL}${this.PATH}/update/${confirmationId}`,
        { deleted: true }
      )
    );
    return response.success;
  }
}
