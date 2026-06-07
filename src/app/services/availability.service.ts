import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';
import {
  AvailabilityResponseDTO,
  AvailabilityMonthDTO,
  OccupancyStatsResponseDTO,
  AvailabilityPeriodRequestDTO,
  AvailabilityPeriodResponseDTO
} from '../core/models';

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private baseUrl = this.apiConfig.API_URL;

  getStatus(spaceId: number, date: string): Observable<AvailabilityResponseDTO> {
    return this.http.get<AvailabilityResponseDTO>(
      `${this.baseUrl}/availabilitySpaces/${spaceId}/availability/status`,
      { params: { date } }
    );
  }

  getMonth(spaceId: number, year: number, month: number): Observable<AvailabilityMonthDTO> {
    return this.http.get<AvailabilityMonthDTO>(
      `${this.baseUrl}/availabilitySpaces/${spaceId}/availability/month/${year}/${month}`
    );
  }

  getStats(spaceId: number, year: number, month: number): Observable<OccupancyStatsResponseDTO> {
    return this.http.get<OccupancyStatsResponseDTO>(
      `${this.baseUrl}/availabilitySpaces/${spaceId}/availability/stats/${year}/${month}`
    );
  }

  getPeriod(spaceId: number, payload: AvailabilityPeriodRequestDTO): Observable<AvailabilityPeriodResponseDTO> {
    return this.http.post<AvailabilityPeriodResponseDTO>(
      `${this.baseUrl}/availabilitySpaces/${spaceId}/availability/period`,
      payload
    );
  }
}
