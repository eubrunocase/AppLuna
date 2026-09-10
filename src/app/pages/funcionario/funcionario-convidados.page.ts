import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { ReservationResponseDTO, GuestResponseDTO } from '../../core/models';
import { GuestListItemComponent } from '../../shared/components/guest-list-item/guest-list-item.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { getSpaceLabel } from '../../shared/constants/space.constants';
import { formatDate, checkIfEventDay } from '../../shared/utils/date.utils';
import { catchError, finalize, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-funcionario-convidados',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/funcionario/reservas"></ion-back-button>
        </ion-buttons>
        <ion-title>Lista de Convidados</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="isLoading" class="loading-state">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Carregando convidados...</p>
      </div>

      <div *ngIf="!isLoading && reservation">
        <div class="summary-card">
          <ion-icon name="calendar-outline"></ion-icon>
          <div>
            <p class="summary-title">{{ spaceLabel }}</p>
            <p class="summary-date">{{ formatDisplayDate(reservation.date) }}</p>
          </div>
        </div>

        <div class="event-status" [class.event-status-active]="isEventDay" [class.event-status-inactive]="!isEventDay">
          <ion-icon [name]="isEventDay ? 'information-circle-outline' : 'time-outline'"></ion-icon>
          <span>{{ isEventDay ? 'Dia do evento - Check-in disponível' : 'Fora do dia do evento - Apenas consulta' }}</span>
        </div>

        <div class="guest-count" *ngIf="guests.length > 0">
          <span>{{ checkedInCount }}/{{ guests.length }} convidados presentes</span>
        </div>

        <app-guest-list-item
          *ngFor="let g of guests"
          [guest]="g"
          [isEventDay]="isEventDay"
          [canCheckIn]="true"
          (checkInClick)="onCheckIn($event)">
        </app-guest-list-item>

        <app-empty-state
          *ngIf="guests.length === 0"
          icon="people-outline"
          title="Nenhum convidado"
          message="Esta reserva não possui convidados cadastrados">
        </app-empty-state>
      </div>
    </ion-content>
  `,
  styles: [`
    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; gap: 12px; color: rgba(255, 248, 240, 0.82); }
    .summary-card {
      display: flex; align-items: center; gap: 12px; background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.26); border-radius: 12px; padding: 16px; margin-bottom: 16px;
    }
    .summary-card ion-icon { font-size: 28px; color: var(--ion-color-primary); }
    .summary-title { margin: 0; font-size: 16px; font-weight: 600; color: #fff8f0; }
    .summary-date { margin: 4px 0 0 0; font-size: 13px; color: rgba(255, 248, 240, 0.82); }
    .event-status {
      display: flex; align-items: center; gap: 8px; border-radius: 10px;
      padding: 12px 16px; margin-bottom: 16px; color: #fff; font-size: 14px; font-weight: 500;
    }
    .event-status-active { background: var(--ion-color-success); }
    .event-status-inactive { background: var(--ion-color-medium); }
    .guest-count { margin-bottom: 16px; font-size: 14px; color: rgba(255, 248, 240, 0.7); font-weight: 500; }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, GuestListItemComponent, EmptyStateComponent]
})
export class FuncionarioConvidadosPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservationService = inject(ReservationService);

  reservation: ReservationResponseDTO | null = null;
  guests: GuestResponseDTO[] = [];
  isLoading = false;
  isEventDay = false;

  get spaceLabel(): string { return this.reservation ? getSpaceLabel(String(this.reservation.space.type)) : ''; }
  get checkedInCount(): number { return this.guests.filter(g => g.checkedIn).length; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.loadData(id);
  }

  private loadData(id: string): void {
    this.isLoading = true;
    this.reservationService.getById(id).pipe(
      catchError(() => { this.router.navigate(['/funcionario/reservas']); return of(null); }),
      switchMap(r => {
        if (!r) return of({ reservation: null, guests: [] });
        this.reservation = r;
        this.isEventDay = checkIfEventDay(r.date);
        return this.reservationService.getGuests(id).pipe(
          catchError(() => of([])),
          switchMap(guests => of({ reservation: r, guests }))
        );
      }),
      finalize(() => this.isLoading = false)
    ).subscribe(result => { if (result) this.guests = result.guests || []; });
  }

  formatDisplayDate(d: string): string { return formatDate(d); }

  onCheckIn(guest: GuestResponseDTO): void {
    if (!this.reservation) return;
    this.reservationService.checkInGuest(this.reservation.id, guest.id).pipe(
      catchError(() => of(null))
    ).subscribe(() => { guest.checkedIn = true; guest.checkedInAt = new Date().toISOString(); });
  }
}
