import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserSummaryDTO, ResponseUserDTO, RequestUserDTO } from '../core/models';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private baseUrl = this.apiConfig.API_URL;

  getSummary(): Observable<UserSummaryDTO[]> {
    return this.http.get<UserSummaryDTO[]>(`${this.baseUrl}/users/summary`);
  }

  getAll(): Observable<ResponseUserDTO[]> {
    return this.http.get<ResponseUserDTO[]>(`${this.baseUrl}/users`);
  }

  create(payload: RequestUserDTO): Observable<ResponseUserDTO> {
    return this.http.post<ResponseUserDTO>(`${this.baseUrl}/users/create`, payload);
  }

  update(id: string, payload: RequestUserDTO): Observable<ResponseUserDTO> {
    return this.http.put<ResponseUserDTO>(`${this.baseUrl}/users/update/${id}`, payload);
  }
}
