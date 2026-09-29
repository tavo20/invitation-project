import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SongInfo } from '../models/music.models';

interface SearchApiResponse {
  success: boolean;
  data: {
    tracks: SongInfo[];
    total: number;
    limit: number;
    offset: number;
  };
}

@Injectable({ providedIn: 'root' })
export class SongSearchService {
  private readonly API = `${environment.apiUrl}api/song`;

  constructor(private http: HttpClient) {}

  search(query: string, limit = 10, offset = 0): Observable<SongInfo[]> {
    return this.http
      .get<SearchApiResponse>(`${this.API}/search`, {
        params: { q: query, limit: limit.toString(), offset: offset.toString() },
      })
      .pipe(map((res) => res.success ? res.data.tracks : []));
  }
}
