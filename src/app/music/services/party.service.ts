import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  AuthResponse,
  DjLoginPayload,
  DjRegisterPayload,
  DjUser,
  Party,
  CreatePartyPayload,
  PartyConfig,
  PartyStatus,
} from '../models/music.models';

const TOKEN_KEY = 'dj_token';

@Injectable({ providedIn: 'root' })
export class PartyService {
  private readonly API = `${environment.apiUrl}api`;

  constructor(private http: HttpClient) {}

  // ==========================
  // Auth
  // ==========================

  register(payload: DjRegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API}/dj/register`, payload)
      .pipe(map((res) => {
        const token = res?.data?.token ?? (res as any)?.token;
        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
        }
        return res;
      }));
  }

  login(payload: DjLoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API}/dj/login`, payload)
      .pipe(
        tap((res) => {
          console.log('LOGIN RESPONSE:', JSON.stringify(res));
          const token = res?.data?.token ?? (res as any)?.token;
          console.log('TOKEN EXTRACTED:', token);
          if (token) {
            localStorage.setItem(TOKEN_KEY, token);
            console.log('TOKEN SAVED:', localStorage.getItem(TOKEN_KEY));
            debugger;
          }
        }),
      );
  }

  getProfile(): Observable<DjUser> {
    return this.http
      .get<ApiResponse<DjUser>>(`${this.API}/dj/me`, { headers: this.authHeaders() })
      .pipe(map((res) => res.data));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ==========================
  // Fiestas
  // ==========================

  create(payload: CreatePartyPayload): Observable<Party> {
    return this.http
      .post<ApiResponse<Party>>(`${this.API}/party/create`, payload, {
        headers: this.authHeaders(),
      })
      .pipe(map((res) => res.data));
  }

  getMyParties(): Observable<Party[]> {
    return this.http
      .get<ApiResponse<Party[]>>(`${this.API}/party/my-parties`, {
        headers: this.authHeaders(),
      })
      .pipe(map((res) => res.data));
  }

  getByCode(code: string): Observable<Party> {
    return this.http
      .get<ApiResponse<Party>>(`${this.API}/party/by-code/${code}`)
      .pipe(map((res) => res.data));
  }

  updateStatus(partyId: string, status: PartyStatus): Observable<Party> {
    return this.http
      .put<ApiResponse<Party>>(
        `${this.API}/party/${partyId}/status`,
        { status },
        { headers: this.authHeaders() },
      )
      .pipe(map((res) => res.data));
  }

  updateConfig(partyId: string, config: Partial<PartyConfig>): Observable<Party> {
    return this.http
      .put<ApiResponse<Party>>(
        `${this.API}/party/${partyId}/config`,
        config,
        { headers: this.authHeaders() },
      )
      .pipe(map((res) => res.data));
  }

  // ==========================
  // Helpers
  // ==========================

  private saveToken(res: AuthResponse): void {
    if (res.success && res.data?.token) {
      localStorage.setItem(TOKEN_KEY, res.data.token);
    }
  }

  private authHeaders(): HttpHeaders {
    const token = this.getToken();
    debugger
    if (token) {
      return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    }
    return new HttpHeaders();
  }
}
