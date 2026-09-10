import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../../../services/reservation.service';
import { AuthService } from '../../../services/auth.service';
import { ReservationResponseDTO, GuestResponseDTO } from '../../../core/models';
import { SpaceType } from '../../../core/models/enums';
import { ReservationTimelineComponent } from '../../../shared/components/reservation-timeline/reservation-timeline.component';
import { ReservationStatusChipComponent } from '../../../shared/components/reservation-status-chip/reservation-status-chip.component';
import { GuestListItemComponent } from '../../../shared/components/guest-list-item/guest-list-item.component';
import { getSpaceLabel } from '../../../shared/constants/space.constants';
import { formatDate, checkIfEventDay } from '../../../shared/utils/date.utils';
import { catchError, finalize, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-reserva-espaco-detalhe',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/reservas/espacos"></ion-back-button>
        </ion-buttons>
        <ion-title>Detalhe da Reserva</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="isLoading" class="loading-state">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <div *ngIf="!isLoading && reservation">
        <div class="summary-card">
          <div class="summary-header">
            <ion-icon name="calendar-outline"></ion-icon>
            <div>
              <p class="summary-title">{{ spaceLabel }}</p>
              <p class="summary-date">{{ formatDisplayDate(reservation.date) }}</p>
            </div>
          </div>
          <app-reservation-status-chip [status]="reservation.status" type="space"></app-reservation-status-chip>
        </div>

        <p *ngIf="reservation.notes" class="notes">{{ reservation.notes }}</p>

        <div class="timeline-section">
          <h3>Acompanhamento</h3>
          <app-reservation-timeline [status]="reservation.status" [spaceType]="getSpaceTypeEnum()"></app-reservation-timeline>
        </div>

        <div *ngIf="guests.length > 0" class="guests-section">
          <h3>Convidados ({{ checkedInCount }}/{{ guests.length }})</h3>
          <app-guest-list-item
            *ngFor="let g of guests"
            [guest]="g"
            [isEventDay]="isEventDay"
            [canCheckIn]="false"
            (checkInClick)="onCheckIn($event)">
          </app-guest-list-item>
        </div>

        <div class="actions">
          <ion-button *ngIf="reservation.status === 'AWAITING_SIGNATURE'" expand="block" color="warning" (click)="signTerm()">
            <ion-icon slot="start" name="document-text-outline"></ion-icon>
            Assinar Termo
          </ion-button>
          <ion-button *ngIf="reservation.status === 'PENDING' || reservation.status === 'APPROVED'" expand="block" color="danger" fill="outline" (click)="cancelReservation()">
            <ion-icon slot="start" name="ban-outline"></ion-icon>
            Cancelar Reserva
          </ion-button>
          <ion-button *ngIf="(isAdmin || isEmployee) && reservation.status === 'CONFIRMED' && (reservation.space.type === 'SALAO_FESTAS' || reservation.space.type === 'CHURRASQUEIRA')"
            expand="block" color="tertiary" fill="outline" (click)="openGuests()">
            <ion-icon slot="start" name="people-outline"></ion-icon>
            Lista de Convidados
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .loading-state { display: flex; justify-content: center; padding: 48px; }
    .summary-card {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.26);
      border-radius: 12px; padding: 16px; margin-bottom: 16px;
    }
    .summary-header { display: flex; align-items: center; gap: 12px; }
    .summary-header ion-icon { font-size: 28px; color: var(--ion-color-primary); }
    .summary-title { margin: 0; font-size: 16px; font-weight: 600; color: #fff8f0; }
    .summary-date { margin: 4px 0 0 0; font-size: 13px; color: rgba(255, 248, 240, 0.82); }
    .notes { font-size: 14px; color: rgba(255, 248, 240, 0.7); margin-bottom: 16px; font-style: italic; }
    .timeline-section, .guests-section { margin-bottom: 24px; }
    .timeline-section h3, .guests-section h3 {
      font-size: 14px; font-weight: 600; color: rgba(255, 248, 240, 0.86);
      margin: 0 0 12px 4px; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .actions { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, ReservationTimelineComponent, ReservationStatusChipComponent, GuestListItemComponent]
})
export class ReservaEspacoDetalhePage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservationService = inject(ReservationService);
  private authService = inject(AuthService);

  reservation: ReservationResponseDTO | null = null;
  guests: GuestResponseDTO[] = [];
  isLoading = false;
  isEventDay = false;
  isAdmin = false;
  isEmployee = false;

  get spaceLabel(): string { return this.reservation ? getSpaceLabel(String(this.reservation.space.type)) : ''; }
  get checkedInCount(): number { return this.guests.filter(g => g.checkedIn).length; }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.isEmployee = this.authService.isEmployee();
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.loadData(id);
  }

  private loadData(id: string): void {
    this.isLoading = true;
    this.reservationService.getById(id).pipe(
      catchError(() => { this.router.navigate(['/reservas/espacos']); return of(null); }),
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

  getSpaceTypeEnum(): SpaceType { return (this.reservation?.space?.type as SpaceType) || SpaceType.SALAO_FESTAS; }

  formatDisplayDate(d: string): string { return formatDate(d); }

  signTerm(): void {
    if (!this.reservation) return;
    this.router.navigate(['/reservas/espacos', this.reservation.id, 'termo']);
  }

  cancelReservation(): void {
    if (!this.reservation) return;
    this.reservationService.delete(this.reservation.id).pipe(
      catchError(() => of(null))
    ).subscribe(() => this.router.navigate(['/reservas/espacos']));
  }

  openGuests(): void {
    if (!this.reservation) return;
    this.router.navigate(['/funcionario/reservas', this.reservation.id, 'convidados']);
  }

  onCheckIn(guest: GuestResponseDTO): void {
    if (!this.reservation) return;
    this.reservationService.checkInGuest(this.reservation.id, guest.id).pipe(
      catchError(() => of(null))
    ).subscribe(() => { guest.checkedIn = true; guest.checkedInAt = new Date().toISOString(); });
  }
}
