import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EquipmentReservationRequestDTO, EquipmentReservationResponseDTO } from '../core/models';
import { EquipmentReservationStatus } from '../core/models/enums';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({ providedIn: 'root' })
export class EquipmentReservationService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private baseUrl = this.apiConfig.API_URL;

  create(payload: EquipmentReservationRequestDTO): Observable<EquipmentReservationResponseDTO> {
    return this.http.post<EquipmentReservationResponseDTO>(`${this.baseUrl}/equipment-reservation`, payload);
  }

  list(params?: { date?: string; status?: EquipmentReservationStatus }): Observable<EquipmentReservationResponseDTO[]> {
    const query = params
      ? `?${Object.entries(params)
          .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
          .join('&')}`
      : '';
    return this.http.get<EquipmentReservationResponseDTO[]>(`${this.baseUrl}/equipment-reservation${query}`);
  }

  handover(id: string): Observable<EquipmentReservationResponseDTO> {
    return this.http.patch<EquipmentReservationResponseDTO>(`${this.baseUrl}/equipment-reservation/${id}/handover`, {});
  }

  returnItem(id: string): Observable<EquipmentReservationResponseDTO> {
    return this.http.patch<EquipmentReservationResponseDTO>(`${this.baseUrl}/equipment-reservation/${id}/return`, {});
  }
}
