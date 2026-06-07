import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import {
  ReservationCreateDTO,
  ReservationResponseDTO,
  MonthlyReservationReportDTO
} from '../core/models';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private baseUrl = this.apiConfig.API_URL;

  private reservationUpdatedSource = new Subject<void>();
  reservationUpdated$ = this.reservationUpdatedSource.asObservable();

  create(payload: ReservationCreateDTO): Observable<ReservationResponseDTO> {
    return this.http.post<ReservationResponseDTO>(`${this.baseUrl}/reservation`, payload).pipe(
      tap(() => this.reservationUpdatedSource.next())
    );
  }

  getAll(): Observable<ReservationResponseDTO[]> {
    return this.http.get<ReservationResponseDTO[]>(`${this.baseUrl}/reservation`);
  }

  getById(id: string): Observable<ReservationResponseDTO> {
    return this.http.get<ReservationResponseDTO>(`${this.baseUrl}/reservation/${id}`);
  }

  getByUser(userId: string): Observable<ReservationResponseDTO[]> {
    return this.http.get<ReservationResponseDTO[]>(`${this.baseUrl}/reservation/findByUser/${userId}`);
  }

  update(id: string, payload: { user: string; date: string; space: number }): Observable<ReservationResponseDTO> {
    return this.http.put<ReservationResponseDTO>(`${this.baseUrl}/reservation/${id}`, payload).pipe(
      tap(() => this.reservationUpdatedSource.next())
    );
  }

  approve(id: string): Observable<ReservationResponseDTO> {
    return this.http.put<ReservationResponseDTO>(`${this.baseUrl}/reservation/${id}/approve`, {}).pipe(
      tap(() => this.reservationUpdatedSource.next())
    );
  }

  reject(id: string): Observable<ReservationResponseDTO> {
    return this.http.put<ReservationResponseDTO>(`${this.baseUrl}/reservation/${id}/reject`, {}).pipe(
      tap(() => this.reservationUpdatedSource.next())
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/reservation/${id}`).pipe(
      tap(() => this.reservationUpdatedSource.next())
    );
  }

  checkAvailability(date: string, spaceId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/reservation/checkAvaliability/${date}/${spaceId}`);
  }

  getMonthlyReport(month: number, year: number): Observable<MonthlyReservationReportDTO[]> {
    return this.http.get<MonthlyReservationReportDTO[]>(
      `${this.baseUrl}/reservation/report/monthly?month=${month}&year=${year}`
    );
  }
}