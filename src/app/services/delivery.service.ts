import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestDeliveryDTO, ResponseDeliveryDTO } from '../core/models';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private baseUrl = this.apiConfig.API_URL;

  create(payload: RequestDeliveryDTO): Observable<ResponseDeliveryDTO> {
    return this.http.post<ResponseDeliveryDTO>(`${this.baseUrl}/delivery/create`, payload);
  }

  findAll(): Observable<ResponseDeliveryDTO[]> {
    return this.http.get<ResponseDeliveryDTO[]>(`${this.baseUrl}/delivery/findAll`);
  }

  confirmReceipt(id: string, pickedUpBy: string): Observable<ResponseDeliveryDTO> {
    const url = `${this.baseUrl}/delivery/${id}/confirm-receipt?pickedUpBy=${encodeURIComponent(pickedUpBy)}`;
    return this.http.patch<ResponseDeliveryDTO>(url, {});
  }
}
