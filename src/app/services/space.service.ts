import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, timeout } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';
import { SpaceInfo } from '../core/models';

@Injectable({ providedIn: 'root' })
export class SpaceService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private baseUrl = this.apiConfig.API_URL;

  getAll(): Observable<SpaceInfo[]> {
    return this.http.get<SpaceInfo[]>(`${this.baseUrl}/space`).pipe(
      timeout(15_000),
      map((list) => (Array.isArray(list) ? list : [])),
    );
  }
}
