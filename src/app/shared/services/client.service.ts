import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly BACKEND_URL = environment.apiUrl;
  private readonly PATH = 'api/cliente';

  constructor(private http: HttpClient) {}


  getClientBySlug(slug: string): Observable<any> {
    return this.http.get<any>(`${this.BACKEND_URL}${this.PATH}/by-slug/${slug}`);
  }




}
