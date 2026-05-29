import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OccurrenceCreateRequestDTO, OccurrenceResponseDTO } from '../core/models';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({ providedIn: 'root' })
export class OccurrenceService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private baseUrl = this.apiConfig.API_URL;

  create(payload: OccurrenceCreateRequestDTO): Observable<OccurrenceResponseDTO> {
    return this.http.post<OccurrenceResponseDTO>(`${this.baseUrl}/occurrences`, payload);
  }
}
