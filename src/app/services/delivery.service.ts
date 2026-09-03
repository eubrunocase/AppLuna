import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import {
  DeliveryDownloadUrlResponse,
  DeliveryUploadUrlResponse,
  RequestDeliveryDTO,
  ResponseDeliveryDTO,
} from '../core/models';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private baseUrl = this.apiConfig.API_URL;

  /**
   * Fluxo completo: pede URL assinada → PUT direto no MinIO → cria encomenda com voucherKey.
   */
  createWithPhoto(
    payload: Omit<RequestDeliveryDTO, 'voucherKey'>,
    file: Blob,
    fileName: string,
    contentType: string,
  ): Observable<ResponseDeliveryDTO> {
    return this.requestUploadUrl(payload.user, fileName).pipe(
      switchMap(({ uploadUrl, key }) =>
        from(this.putFileToPresignedUrl(uploadUrl, file, contentType)).pipe(
          switchMap(() => this.create({ ...payload, voucherKey: key })),
        ),
      ),
    );
  }

  requestUploadUrl(userId: string, fileName: string): Observable<DeliveryUploadUrlResponse> {
    const params = new URLSearchParams({
      userId,
      fileName,
    });
    return this.http.post<DeliveryUploadUrlResponse>(
      `${this.baseUrl}/delivery/upload-url?${params.toString()}`,
      {},
    );
  }

  /**
   * Upload direto ao MinIO via fetch (sem HttpClient) para não anexar JWT
   * nem passar pelo interceptor de sessão.
   */
  private async putFileToPresignedUrl(
    uploadUrl: string,
    file: Blob,
    contentType: string,
  ): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Falha no upload da imagem (${response.status}).`);
    }
  }

  create(payload: RequestDeliveryDTO): Observable<ResponseDeliveryDTO> {
    return this.http.post<ResponseDeliveryDTO>(`${this.baseUrl}/delivery/create`, payload);
  }

  findAll(): Observable<ResponseDeliveryDTO[]> {
    return this.http.get<ResponseDeliveryDTO[]>(`${this.baseUrl}/delivery/findAll`);
  }

  findById(id: string): Observable<ResponseDeliveryDTO> {
    return this.http.get<ResponseDeliveryDTO>(`${this.baseUrl}/delivery/find/${id}`);
  }

  update(id: string, payload: RequestDeliveryDTO): Observable<ResponseDeliveryDTO> {
    return this.http.put<ResponseDeliveryDTO>(`${this.baseUrl}/delivery/update/${id}`, payload);
  }

  findByUser(userId: string): Observable<ResponseDeliveryDTO[]> {
    return this.http.get<ResponseDeliveryDTO[]>(`${this.baseUrl}/delivery/findByUser/${userId}`);
  }

  confirmReceipt(id: string, pickedUpBy?: string): Observable<ResponseDeliveryDTO> {
    const query = pickedUpBy ? `?pickedUpBy=${encodeURIComponent(pickedUpBy)}` : '';
    return this.http.put<ResponseDeliveryDTO>(`${this.baseUrl}/delivery/${id}/confirm-receipt${query}`, {});
  }

  getDownloadUrl(deliveryId: string): Observable<DeliveryDownloadUrlResponse> {
    return this.http.get<DeliveryDownloadUrlResponse>(
      `${this.baseUrl}/delivery/${deliveryId}/download-url`,
    );
  }
}
