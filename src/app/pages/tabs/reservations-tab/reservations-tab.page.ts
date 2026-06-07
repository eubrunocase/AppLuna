import { Component, inject, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
        <ion-title>{{ isAdmin && viewMode === 'all' ? 'Reservas do Condomínio' : 'Minhas Reservas' }}</ion-title>
      </ion-toolbar>

      <ion-toolbar *ngIf="isAdmin && viewMode === 'all' && pendingCount > 0" color="warning" class="pending-banner">
        <div class="pending-banner-content">
          <ion-icon name="alert-circle-outline"></ion-icon>
          <span>
            <strong>{{ pendingCount }}</strong>
            {{ pendingCount === 1 ? 'reserva aguarda' : 'reservas aguardam' }} sua decisão
          </span>
          <ion-button size="small" fill="clear" color="dark" (click)="focusPending()">
            Revisar
            <ion-icon name="arrow-forward" slot="end"></ion-icon>
          </ion-button>
        </div>
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
        <ion-card *ngFor="let reservation of filteredReservations"
                  class="reservation-card"
                  [class.pending-highlight]="isAdmin && viewMode === 'all' && reservation.status === 'PENDING'">
          <ion-card-content>
            <div class="card-row">
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
            </div>

            <div *ngIf="isAdmin && viewMode === 'all' && reservation.status === 'PENDING'"
                 class="admin-actions">
              <ion-button
                expand="block"
                color="success"
                [disabled]="processingId === reservation.id"
                (click)="approveReservation(reservation)">
                <ion-spinner *ngIf="processingId === reservation.id" name="dots"></ion-spinner>
                <ng-container *ngIf="processingId !== reservation.id">
                  <ion-icon slot="start" name="checkmark-circle-outline"></ion-icon>
                  Aprovar
                </ng-container>
              </ion-button>
              <ion-button
                expand="block"
                color="danger"
                fill="outline"
                [disabled]="processingId === reservation.id"
                (click)="rejectReservation(reservation)">
                <ion-icon slot="start" name="close-circle-outline"></ion-icon>
                Rejeitar
              </ion-button>
            </div>

            <div *ngIf="isAdmin && viewMode === 'all' && reservation.status === 'APPROVED'"
                 class="admin-actions admin-actions-secondary">
              <ion-button
                expand="block"
                color="medium"
                fill="outline"
                size="small"
                [disabled]="processingId === reservation.id"
                (click)="cancelReservation(reservation)">
                <ion-icon slot="start" name="ban-outline"></ion-icon>
                Cancelar Reserva
              </ion-button>
            </div>
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
      transition: box-shadow 0.2s ease, border-color 0.2s ease;
    }

    .reservation-card.pending-highlight {
      border-left: 4px solid var(--ion-color-warning);
      box-shadow: 0 6px 20px rgba(255, 196, 9, 0.18);
    }

    .reservation-card ion-card-content {
      padding: 16px;
    }

    .card-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .admin-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.18);
    }

    .admin-actions ion-button {
      flex: 1;
      --border-radius: 10px;
      margin: 0;
    }

    .admin-actions-secondary {
      border-top: none;
      padding-top: 0;
      margin-top: 8px;
    }

    .pending-banner-content {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px 16px;
    }

    .pending-banner-content ion-icon {
      font-size: 20px;
    }

    .pending-banner-content span {
      flex: 1;
      font-size: 13px;
    }

    .pending-banner-content strong {
      font-size: 16px;
      margin-right: 4px;
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
  private route = inject(ActivatedRoute);
  private uiService = inject(UiService);
  private alertController = inject(AlertController);

  reservations: ReservationResponseDTO[] = [];
  filteredReservations: ReservationResponseDTO[] = [];
  isLoading = false;
  isAdmin = false;
  viewMode: 'mine' | 'all' = 'mine';
  statusFilter: 'ALL' | 'PENDING' | 'APPROVED' = 'ALL';
  /** id da reserva em ação no momento (bloqueia botões dela). */
  processingId: string | null = null;

  spaceTypes: Record<string, string> = {
    'SALAO_FESTAS': 'Salão de Festas',
    'CHURRASQUEIRA': 'Churrasqueira',
    'ACADEMIA': 'Academia',
    'CAMPO_FUTEBOL': 'Campo de Futebol'
  };

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.applyQueryParams();
    this.loadReservations();
  }

  ionViewWillEnter(): void {
    this.isAdmin = this.authService.isAdmin();
    this.applyQueryParams();
    this.loadReservations();
  }

  /** Permite chegar via `/tabs/reservations?view=all&status=PENDING` (atalho da Home). */
  private applyQueryParams(): void {
    const params = this.route.snapshot.queryParamMap;
    if (this.isAdmin && params.get('view') === 'all') {
      this.viewMode = 'all';
    }
    const status = params.get('status');
    if (status === 'PENDING' || status === 'APPROVED' || status === 'ALL') {
      this.statusFilter = status as 'ALL' | 'PENDING' | 'APPROVED';
    }
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

  get pendingCount(): number {
    return this.reservations.filter(r => r.status === ReservationStatus.PENDING).length;
  }

  focusPending(): void {
    this.statusFilter = 'PENDING';
    this.filterByStatus();
  }

  approveReservation(reservation: ReservationResponseDTO): void {
    if (this.processingId) return;
    this.processingId = reservation.id;
    this.reservationService.approve(reservation.id).pipe(
      catchError(error => {
        this.uiService.showError(error?.message || 'Não foi possível aprovar a reserva.');
        return of(null);
      }),
      finalize(() => this.processingId = null)
    ).subscribe(updated => {
      if (updated) {
        this.applyLocalUpdate(updated);
        this.uiService.showSuccess(`Reserva de ${updated.user.name} aprovada.`);
      }
    });
  }

  async rejectReservation(reservation: ReservationResponseDTO): Promise<void> {
    if (this.processingId) return;
    const alert = await this.alertController.create({
      header: 'Rejeitar reserva',
      message: `Confirma a rejeição da reserva de <strong>${reservation.user.name}</strong> em ${this.formatDate(reservation.date)} (${this.getSpaceTypeLabel(reservation.space.type)})?`,
      buttons: [
        { text: 'Voltar', role: 'cancel' },
        {
          text: 'Rejeitar',
          role: 'destructive',
          handler: () => this.doReject(reservation)
        }
      ]
    });
    await alert.present();
  }

  private doReject(reservation: ReservationResponseDTO): void {
    this.processingId = reservation.id;
    this.reservationService.reject(reservation.id).pipe(
      catchError(error => {
        this.uiService.showError(error?.message || 'Não foi possível rejeitar a reserva.');
        return of(null);
      }),
      finalize(() => this.processingId = null)
    ).subscribe(updated => {
      if (updated) {
        this.applyLocalUpdate(updated);
        this.uiService.showSuccess(`Reserva de ${updated.user.name} rejeitada.`);
      }
    });
  }

  async cancelReservation(reservation: ReservationResponseDTO): Promise<void> {
    if (this.processingId) return;
    const alert = await this.alertController.create({
      header: 'Cancelar reserva aprovada',
      message: `Tem certeza que deseja cancelar a reserva de <strong>${reservation.user.name}</strong>? O morador será notificado.`,
      buttons: [
        { text: 'Voltar', role: 'cancel' },
        {
          text: 'Cancelar reserva',
          role: 'destructive',
          handler: () => this.doCancel(reservation)
        }
      ]
    });
    await alert.present();
  }

  private doCancel(reservation: ReservationResponseDTO): void {
    this.processingId = reservation.id;
    this.reservationService.delete(reservation.id).pipe(
      catchError(error => {
        this.uiService.showError(error?.message || 'Não foi possível cancelar a reserva.');
        return of(null);
      }),
      finalize(() => this.processingId = null)
    ).subscribe(result => {
      if (result !== null) {
        // backend só devolve 204 — refazemos o load para refletir o status CANCELLED.
        this.loadReservations();
        this.uiService.showSuccess(`Reserva cancelada.`);
      }
    });
  }

  private applyLocalUpdate(updated: ReservationResponseDTO): void {
    this.reservations = this.reservations.map(r => r.id === updated.id ? updated : r);
    this.filterByStatus();
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
