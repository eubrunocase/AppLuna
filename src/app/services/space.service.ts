import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';
import { SpaceInfo } from '../core/models';

/**
 * KNOWN BACKEND BUG: GET /lunaLink/space serializes the JPA entity directly,
 * producing infinite recursion (Space.reservations -> Reservation.space -> ...).
 * The response either crashes Jackson or trails into 500. Until the backend
 * adds @JsonIgnore (or a proper response DTO), we fall back to the canonical
 * SpaceType list. IDs follow the seeded database ordering.
 */
const SPACE_FALLBACK: SpaceInfo[] = [
  { id: 1, type: 'SALAO_FESTAS' },
  { id: 2, type: 'CHURRASQUEIRA' },
  { id: 3, type: 'ACADEMIA' },
  { id: 4, type: 'CAMPO_FUTEBOL' }
];

@Injectable({ providedIn: 'root' })
export class SpaceService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private baseUrl = this.apiConfig.API_URL;

  getAll(): Observable<SpaceInfo[]> {
    return this.http.get<SpaceInfo[]>(`${this.baseUrl}/space`).pipe(
      map(list => (Array.isArray(list) && list.length > 0 ? list : SPACE_FALLBACK)),
      catchError(() => of(SPACE_FALLBACK))
    );
  }
}
