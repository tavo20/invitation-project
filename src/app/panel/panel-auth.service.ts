import { Injectable, computed, signal } from '@angular/core';
import { Marca } from '../shared/marca/marca.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { PanelApiResponse, PanelCliente, PanelSession } from './panel.models';

const STORAGE_KEY = 'invitapp_panel_session';
const MOCK_KEY = 'invitapp_panel_mock';
const MARCA_KEY = 'invitapp_panel_marca';

/**
 * Sesión del panel de clientes.
 * En desarrollo, `/panel/ingresar?mock=1` entra con un cliente de prueba sin tocar el back.
 */
@Injectable({ providedIn: 'root' })
export class PanelAuthService {
  readonly API = `${environment.apiUrl}api/panel`;
  readonly cliente = signal<PanelCliente | null>(null);

  /** Marca del planner con sesión: la suya si es marca blanca, si no InvitApp. */
  readonly marca = computed<Marca>(() => {
    const c = this.cliente();
    return { marcaBlanca: !!c?.marcaBlanca, nombre: c?.marca || c?.nombre || '', img: c?.img || null, slug: c?.slug || null };
  });

  /** Para títulos de pestaña: "Mis eventos · Hilo Rojo" o "Mis eventos · Panel InvitApp". */
  titulo(seccion: string): string {
    const m = this.marca();
    return `${seccion} · ${m.marcaBlanca && m.nombre ? m.nombre : 'Panel InvitApp'}`;
  }

  /** Ruta de ingreso del planner: con su marca si la tiene (/panel/ingresar/hilo-rojo). */
  rutaIngreso(): string[] {
    const slug = this.cliente()?.slug || this.ultimaMarca();
    if (slug === 'demo') return ['/panel/demo'];
    return slug ? ['/panel/ingresar', slug] : ['/panel/ingresar'];
  }

  recordarMarca(slug: string): void {
    this.safeSet(MARCA_KEY, slug);
  }

  ultimaMarca(): string {
    return this.safeGet(MARCA_KEY) || '';
  }

  constructor(private http: HttpClient) {
    const s = this.readSession();
    if (s) this.cliente.set(s.cliente);
  }

  // ===== Sesión =====

  get token(): string {
    return this.readSession()?.token || '';
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  get isMock(): boolean {
    return !environment.production && this.safeGet(MOCK_KEY) === '1';
  }

  enableMock(): void {
    if (environment.production) return;
    this.safeSet(MOCK_KEY, '1');
  }

  authHeaders(): { headers: HttpHeaders } {
    return { headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` }) };
  }

  async login(email: string, password: string): Promise<PanelSession> {
    if (this.isMock) {
      const session: PanelSession = {
        token: 'mock',
        cliente: { _id: 'mock', nombre: 'Clara Eventos', marca: 'Clara Eventos', email, mustChangePassword: password === 'temporal123' },
      };
      this.saveSession(session);
      return session;
    }
    const session = await this.request(
      this.http.post<PanelApiResponse<PanelSession>>(`${this.API}/auth/login`, { email: email.trim(), password }),
    );
    this.saveSession(session);
    return session;
  }

  /** Entra a la demo pública sin contraseña (/panel/demo). */
  async entrarDemo(): Promise<PanelSession> {
    const session = await this.request(
      this.http.post<PanelApiResponse<PanelSession>>(`${this.API}/auth/demo`, {}),
    );
    this.safeRemove(MOCK_KEY);
    this.saveSession(session);
    return session;
  }

  async refreshMe(): Promise<PanelCliente> {
    if (this.isMock) return this.cliente()!;
    const cliente = await this.request(
      this.http.get<PanelApiResponse<PanelCliente>>(`${this.API}/auth/me`, this.authHeaders()),
    );
    const s = this.readSession();
    if (s) this.saveSession({ ...s, cliente });
    return cliente;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.isMock) {
      await this.request(
        this.http.put<PanelApiResponse<unknown>>(`${this.API}/auth/password`, { currentPassword, newPassword }, this.authHeaders()),
      );
    }
    const s = this.readSession();
    if (s) this.saveSession({ ...s, cliente: { ...s.cliente, mustChangePassword: false } });
  }

  logout(): void {
    const slug = this.cliente()?.slug;
    if (slug) this.recordarMarca(slug);
    this.safeRemove(STORAGE_KEY);
    this.safeRemove(MOCK_KEY);
    this.cliente.set(null);
  }

  // ===== Utilidades =====

  /** Convierte la respuesta del back en datos o en un Error con el mensaje para mostrar. */
  async request<T>(obs: Observable<PanelApiResponse<T>>): Promise<T> {
    try {
      const res = await lastValueFrom(obs);
      if (!res?.success) throw new Error(res?.message || 'Algo salió mal, intenta de nuevo');
      return res.data;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401 && this.isLoggedIn()) this.logout();
        if (err.status === 0) throw new Error('No hay conexión. Revisa tu internet e intenta de nuevo');
        if (err.status === 429) throw new Error('Demasiados intentos. Espera unos minutos e intenta de nuevo');
        throw new Error(err.error?.message || 'Algo salió mal, intenta de nuevo');
      }
      throw err;
    }
  }

  private saveSession(s: PanelSession): void {
    this.safeSet(STORAGE_KEY, JSON.stringify(s));
    this.cliente.set(s.cliente);
  }

  private readSession(): PanelSession | null {
    try {
      const raw = this.safeGet(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as PanelSession) : null;
    } catch {
      return null;
    }
  }

  private safeGet(k: string): string | null {
    try { return localStorage.getItem(k); } catch { return null; }
  }
  private safeSet(k: string, v: string): void {
    try { localStorage.setItem(k, v); } catch { /* sin almacenamiento: la sesión dura lo que la pestaña */ }
  }
  private safeRemove(k: string): void {
    try { localStorage.removeItem(k); } catch { /* nada */ }
  }
}
