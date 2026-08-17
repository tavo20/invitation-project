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
  status?: 'pending' | 'confirmed' | 'cancelled';
}

export interface ConfirmationDocument extends ConfirmationPayload {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConfirmationApiSuccess {
  success: true;
  data: ConfirmationDocument;
}

export interface ConfirmationApiError {
  success: false;
  message: string;
  error?: unknown;
}

export type ConfirmationApiResponse = ConfirmationApiSuccess | ConfirmationApiError;

export interface ConfirmationInviteContext {
  id: string | number | null;
  slug: string | null;
  data: any;
  theme?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private confirmations: ConfirmationPayload[] = [];
  private readonly BACKEND_URL = environment.apiUrl;
  private readonly PATH = 'api/invitation-confirmation';

  constructor(private main: MainService, private http: HttpClient) {}

  /** Resuelve la invitación por id o slug para la pantalla de confirmación. */
  getInvitationContext(param: string): ConfirmationInviteContext | null {
    const record =
      this.main.getDataById({ id: param }) ??
      this.main.getDataBySlug({ slug: param });

    if (!record) return null;

    return {
      id: record.id ?? null,
      slug: record.slug ?? null,
      data: record.data ?? null,
      theme: record.data?.confirmationTheme ?? record.data?.confirmation?.theme ?? null
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
      this.confirmations.push(response.data);
      return response.success;
    }

    throw new Error(response.message || 'Failed to save confirmation');
  }

  getConfirmations(): ConfirmationPayload[] {
    return [...this.confirmations];
  }

  getConfirmationsBySlug(slug: string): ConfirmationPayload[] {
    return this.confirmations.filter((item) => item.invitationSlug === slug);
  }
}
