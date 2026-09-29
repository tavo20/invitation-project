import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  SongRequest,
  CreateRequestPayload,
  RequestStatus,
} from '../models/music.models';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private readonly API = `${environment.apiUrl}api/request`;

  constructor(private http: HttpClient) {}

  create(payload: CreateRequestPayload): Observable<SongRequest> {
    return this.http
      .post<ApiResponse<SongRequest>>(`${this.API}/create`, payload)
      .pipe(map((res) => res.data));
  }

  getByParty(partyId: string): Observable<SongRequest[]> {
    return this.http
      .get<ApiResponse<SongRequest[]>>(`${this.API}/by-party/${partyId}`)
      .pipe(map((res) => res.data));
  }

  toggleLike(requestId: string, sessionId: string): Observable<SongRequest> {
    return this.http
      .put<ApiResponse<SongRequest>>(`${this.API}/${requestId}/like`, {
        session_id: sessionId,
      })
      .pipe(map((res) => res.data));
  }

  updateStatus(requestId: string, status: RequestStatus): Observable<SongRequest> {
    const token = localStorage.getItem('dj_token');
    const headers = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});

    return this.http
      .put<ApiResponse<SongRequest>>(
        `${this.API}/${requestId}/status`,
        { status },
        { headers },
      )
      .pipe(map((res) => res.data));
  }
}
