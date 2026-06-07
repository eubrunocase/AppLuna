import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservationService } from '../../../services/reservation.service';
import { ReservationResponseDTO, ReservationStatus } from '../../../core/models';
import { AuthService } from '../../../services/auth.service';
import { UiService } from '../../../shared/services/ui.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-reservations-tab',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Minhas Reservas</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment [(ngModel)]="statusFilter" (ionChange)="filterByStatus()">
          <ion-segment-button value="ALL">
            <ion-label>Todas</ion-label>
          </ion-segment-button>
          <ion-segment-button value="PENDING">
            <ion-label>Pendentes</ion-label>
          </ion-segment-button>
          <ion-segment-button value="APPROVED">
            <ion-label>Aprovadas</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
      <ion-toolbar *ngIf="isAdmin">
        <ion-segment [(ngModel)]="viewMode" (ionChange)="onViewModeChange()">
          <ion-segment-button value="mine">
            <ion-icon name="person-outline"></ion-icon>
            <ion-label>Minhas</ion-label>
          </ion-segment-button>
          <ion-segment-button value="all">
            <ion-icon name="people-outline"></ion-icon>
            <ion-label>Todas</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div *ngIf="isLoading" class="skeleton-list">
        <div *ngFor="let item of [1,2,3]" class="skeleton-card">
          <ion-skeleton-text animated style="width: 30%; height: 16px;"></ion-skeleton-text>
          <ion-skeleton-text animated style="width: 70%; height: 20px; margin-top: 8px;"></ion-skeleton-text>
          <ion-skeleton-text animated style="width: 50%; height: 14px; margin-top: 8px;"></ion-skeleton-text>
        </div>
      </div>

      <ion-list *ngIf="!isLoading && filteredReservations.length > 0">
        <ion-card *ngFor="let reservation of filteredReservations" class="reservation-card">
          <ion-card-content>
            <div class="date-badge">
              <span class="day">{{ getDay(reservation.date) }}</span>
              <span class="month">{{ getMonth(reservation.date) }}</span>
            </div>

            <div class="reservation-info">
              <h3>{{ getSpaceTypeLabel(reservation.space.type) }}</h3>
              <p class="resident" *ngIf="isAdmin && viewMode === 'all'">
                <ion-icon name="person-outline" class="icon-inline"></ion-icon>
                {{ reservation.user.name }}
              </p>
              <p class="time">
                <ion-icon name="time-outline" class="icon-inline"></ion-icon>
                Solicitado em {{ formatDate(reservation.createdAt) }}
              </p>
            </div>

            <ion-chip [class]="'chip-' + getStatusClass(reservation.status)">
              {{ getStatusLabel(reservation.status) }}
            </ion-chip>
          </ion-card-content>
        </ion-card>
      </ion-list>

      <div *ngIf="!isLoading && filteredReservations.length === 0" class="empty-state">
        <ion-icon name="calendar-outline" class="empty-icon"></ion-icon>
        <p class="empty-title">Nenhuma reserva encontrada</p>
        <p class="empty-message">Suas reservas aparecerão aqui</p>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="openNewReservation()">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    .skeleton-list {
      padding: 0;
    }

    .skeleton-card {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 12px;
    }

    .reservation-card {
      margin-bottom: 12px;
    }

    .reservation-card ion-card-content {
      display: flex;
      align-items: center;
      padding: 16px;
    }

    .date-badge {
      width: 56px;
      height: 56px;
      background: var(--ion-color-tertiary);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      flex-shrink: 0;
    }

    .date-badge .day {
      font-size: 20px;
      font-weight: 700;
      color: #000;
      line-height: 1;
    }

    .date-badge .month {
      font-size: 11px;
      font-weight: 600;
      color: #000;
      text-transform: uppercase;
    }

    .reservation-info {
      flex: 1;
      min-width: 0;
    }

    .reservation-info h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: #fff8f0;
    }

    .reservation-info .time,
    .reservation-info .resident {
      margin: 0;
      font-size: 12px;
      color: rgba(255, 248, 240, 0.82);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .reservation-info .resident {
      margin-bottom: 2px;
    }

    .icon-inline {
      font-size: 14px;
      color: rgba(255, 248, 240, 0.82);
      flex-shrink: 0;
    }

    ion-chip {
      flex-shrink: 0;
    }

    .chip-PENDING {
      --background: var(--ion-color-tertiary);
      --color: #000;
    }

    .chip-APPROVED {
      --background: var(--ion-color-success);
      --color: #fff;
    }

    .chip-REJECTED, .chip-CANCELLED {
      --background: var(--ion-color-danger);
      --color: #fff;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ReservationsTabPage implements OnInit {
  private reservationService = inject(ReservationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private uiService = inject(UiService);

  reservations: ReservationResponseDTO[] = [];
  filteredReservations: ReservationResponseDTO[] = [];
  isLoading = false;
  isAdmin = false;
  viewMode: 'mine' | 'all' = 'mine';
  statusFilter: 'ALL' | 'PENDING' | 'APPROVED' = 'ALL';

  spaceTypes: Record<string, string> = {
    'SALAO_FESTAS': 'Salão de Festas',
    'CHURRASQUEIRA': 'Churrasqueira',
    'ACADEMIA': 'Academia',
    'CAMPO_FUTEBOL': 'Campo de Futebol'
  };

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadReservations();
  }

  ionViewWillEnter(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.isLoading = false;
      return;
    }

    const reservations$ = (this.isAdmin && this.viewMode === 'all')
      ? this.reservationService.getAll()
      : this.reservationService.getByUser(currentUser.id);

    reservations$.pipe(
      catchError(() => of([])),
      finalize(() => this.isLoading = false)
    ).subscribe(reservations => {
      this.reservations = reservations;
      this.filterByStatus();
    });
  }

  onViewModeChange(): void {
    this.loadReservations();
  }

  refresh(event: any): void {
    this.loadReservations();
    setTimeout(() => event.target.complete(), 1000);
  }

  filterByStatus(): void {
    if (this.statusFilter === 'ALL') {
      this.filteredReservations = [...this.reservations];
    } else {
      this.filteredReservations = this.reservations.filter(r => r.status === this.statusFilter);
    }
  }

  getDay(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.getDate().toString();
  }

  getMonth(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { month: 'short' });
  }

  getSpaceTypeLabel(type: string): string {
    return this.spaceTypes[type] || type;
  }

  getStatusLabel(status: ReservationStatus): string {
    const labels: Record<ReservationStatus, string> = {
      [ReservationStatus.PENDING]: 'Pendente',
      [ReservationStatus.APPROVED]: 'Aprovada',
      [ReservationStatus.REJECTED]: 'Rejeitada',
      [ReservationStatus.CANCELLED]: 'Cancelada'
    };
    return labels[status] || status;
  }

  getStatusClass(status: ReservationStatus): string {
    return status.toLowerCase();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  }

  openNewReservation(): void {
    this.router.navigate(['/reservations/new']);
  }
}
