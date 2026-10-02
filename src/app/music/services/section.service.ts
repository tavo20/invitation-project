import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CreateSectionPayload,
  PartySection,
  SectionStatus,
  SongRequest,
  UpdateSectionPayload,
} from '../models/music.models';

@Injectable({ providedIn: 'root' })
export class SectionService {
  private readonly API = `${environment.apiUrl}api/section`;

  constructor(private http: HttpClient) {}

  getByParty(partyId: string): Observable<PartySection[]> {
    return this.http
      .get<ApiResponse<PartySection[]>>(`${this.API}/by-party/${partyId}`)
      .pipe(map((res) => res.data ?? []));
  }

  getRanking(sectionId: string): Observable<SongRequest[]> {
    return this.http
      .get<ApiResponse<SongRequest[]>>(`${this.API}/${sectionId}/ranking`)
      .pipe(map((res) => res.data ?? []));
  }

  create(payload: CreateSectionPayload): Observable<PartySection> {
    return this.http
      .post<ApiResponse<PartySection>>(`${this.API}/create`, payload, {
        headers: this.authHeaders(),
      })
      .pipe(map((res) => res.data));
  }

  update(sectionId: string, payload: UpdateSectionPayload): Observable<PartySection> {
    return this.http
      .put<ApiResponse<PartySection>>(`${this.API}/${sectionId}`, payload, {
        headers: this.authHeaders(),
      })
      .pipe(map((res) => res.data));
  }

  updateStatus(sectionId: string, status: SectionStatus): Observable<PartySection> {
    return this.http
      .put<ApiResponse<PartySection>>(
        `${this.API}/${sectionId}/status`,
        { status },
        { headers: this.authHeaders() },
      )
      .pipe(map((res) => res.data));
  }

  delete(sectionId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<unknown>>(`${this.API}/${sectionId}`, {
        headers: this.authHeaders(),
      })
      .pipe(map(() => undefined));
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('dj_token');
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }
}
