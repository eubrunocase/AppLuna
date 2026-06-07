import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ReservationService } from '../../../services/reservation.service';
import { DeliveryService } from '../../../services/delivery.service';
import { UiService } from '../../../shared/services/ui.service';
import { UserRoles } from '../../../core/models';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-home-tab',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>LunaLink</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()">
            <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="welcome-section">
        <h2>Olá, {{ userName }}</h2>
        <p>Bem-vindo ao Luna Link</p>
      </div>

      <div class="quick-access">
        <h3 class="section-title">Acesso Rápido</h3>
        <div class="quick-grid">
          <ion-card *ngIf="canCreateReservation" class="quick-card" (click)="openNewReservation()">
            <ion-card-content>
              <ion-icon name="add-circle-outline" style="color: var(--ion-color-primary);"></ion-icon>
              <span>Nova Reserva</span>
            </ion-card-content>
          </ion-card>

          <ion-card *ngIf="canCreateOccurrence" class="quick-card" (click)="openNewOccurrence()">
            <ion-card-content>
              <ion-icon name="warning-outline" style="color: var(--ion-color-danger);"></ion-icon>
              <span>Reportar Ocorrência</span>
            </ion-card-content>
          </ion-card>

          <ion-card *ngIf="canManageDeliveries" class="quick-card" (click)="openDeliveriesManagement()">
            <ion-card-content>
              <ion-icon name="cube-outline" style="color: var(--ion-color-success);"></ion-icon>
              <span>Registrar Entrega</span>
            </ion-card-content>
          </ion-card>

          <ion-card *ngIf="canManageEquipment" class="quick-card" (click)="openEquipmentFlow()">
            <ion-card-content>
              <ion-icon name="construct-outline" style="color: var(--ion-color-warning);"></ion-icon>
              <span>Equipamentos</span>
            </ion-card-content>
          </ion-card>

          <ion-card *ngIf="isAdmin" class="quick-card" (click)="openUsers()">
            <ion-card-content>
              <ion-icon name="people-outline" style="color: var(--ion-color-danger);"></ion-icon>
              <span>Usuários</span>
            </ion-card-content>
          </ion-card>

          <ion-card *ngIf="isAdmin" class="quick-card" (click)="openReports()">
            <ion-card-content>
              <ion-icon name="bar-chart-outline" style="color: var(--ion-color-medium);"></ion-icon>
              <span>Relatórios</span>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <div class="status-cards">
        <h3 class="section-title">Resumo</h3>

        <ion-card *ngIf="isAdmin" class="status-card status-card-pending" (click)="goToPendingApprovals()">
          <ion-card-content>
            <div class="status-icon pending-icon">
              <ion-icon name="alert-circle-outline"></ion-icon>
            </div>
            <div class="status-info">
              <span class="status-value">{{ pendingApprovals }}</span>
              <span class="status-label">
                {{ pendingApprovals === 1 ? 'Reserva aguarda aprovação' : 'Reservas aguardam aprovação' }}
              </span>
            </div>
            <ion-icon name="chevron-forward-outline" class="chevron"></ion-icon>
          </ion-card-content>
        </ion-card>

        <ion-card class="status-card" (click)="goToDeliveries()">
          <ion-card-content>
            <div class="status-icon delivery-icon">
              <ion-icon name="cube-outline"></ion-icon>
            </div>
            <div class="status-info">
              <span class="status-value">{{ pendingDeliveries }}</span>
              <span class="status-label">Encomendas Pendentes</span>
            </div>
            <ion-icon name="chevron-forward-outline" class="chevron"></ion-icon>
          </ion-card-content>
        </ion-card>

        <ion-card *ngIf="canSeeReservationsSummary" class="status-card" (click)="goToReservations()">
          <ion-card-content>
            <div class="status-icon reservation-icon">
              <ion-icon name="calendar-outline"></ion-icon>
            </div>
            <div class="status-info">
              <span class="status-value">{{ activeReservations }}</span>
              <span class="status-label">Reservas Ativas</span>
            </div>
            <ion-icon name="chevron-forward-outline" class="chevron"></ion-icon>
          </ion-card-content>
        </ion-card>
      </div>

      <div class="info-section">
        <h3 class="section-title">Avisos</h3>
        <ion-card>
          <ion-card-content>
            <ion-icon name="information-circle-outline" class="info-icon"></ion-icon>
            <p>Mantenha suas informações atualizadas na página de gerenciamento.</p>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .welcome-section {
      text-align: center;
      padding: 24px;
      background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%);
      border-radius: 20px;
      color: white;
      margin-bottom: 24px;
    }

    .welcome-section h2 {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: 700;
      color: white;
    }

    .welcome-section p {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--ion-color-medium);
      margin: 0 0 12px 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .quick-access {
      margin-bottom: 24px;
    }

    .quick-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .quick-card {
      margin: 0;
      text-align: center;
    }

    .quick-card ion-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 16px;
    }

    .quick-card ion-icon {
      font-size: 36px;
      margin-bottom: 8px;
    }

    .quick-card span {
      font-size: 13px;
      font-weight: 500;
      color: var(--ion-color-dark);
    }

    .status-cards {
      margin-bottom: 24px;
    }

    .status-card {
      margin-bottom: 12px;
    }

    .status-card ion-card-content {
      display: flex;
      align-items: center;
      padding: 16px;
    }

    .status-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
    }

    .status-icon.delivery-icon {
      background: var(--ion-color-success);
    }

    .status-icon.reservation-icon {
      background: var(--ion-color-secondary);
    }

    .status-icon.pending-icon {
      background: var(--ion-color-warning);
    }

    .status-card.status-card-pending {
      border-left: 4px solid var(--ion-color-warning);
    }

    .status-card.status-card-pending .status-value {
      color: var(--ion-color-warning-shade);
    }

    .status-icon ion-icon {
      font-size: 24px;
      color: white;
    }

    .info-icon {
      color: var(--ion-color-primary);
      font-size: 20px;
      flex-shrink: 0;
    }

    .status-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .status-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--ion-color-dark);
    }

    .status-label {
      font-size: 13px;
      color: var(--ion-color-medium);
    }

    .chevron {
      color: var(--ion-color-medium);
      font-size: 20px;
    }

    .info-section ion-card-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
    }

    .info-section p {
      margin: 0;
      font-size: 14px;
      color: var(--ion-color-medium);
      line-height: 1.4;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HomeTabPage implements OnInit {
  private authService = inject(AuthService);
  private reservationService = inject(ReservationService);
  private deliveryService = inject(DeliveryService);
  private router = inject(Router);
  private uiService = inject(UiService);

  userName = 'Usuário';
  isAdmin = false;
  isEmployee = false;
  isResident = false;

  canCreateReservation = false;
  canCreateOccurrence = false;
  canManageDeliveries = false;
  canManageEquipment = false;
  canSeeReservationsSummary = false;

  pendingDeliveries = 0;
  activeReservations = 0;
  pendingApprovals = 0;

  ngOnInit(): void {
    this.refreshUserState();
  }

  // Ionic lifecycle: dispara em toda visita à aba, mesmo quando o componente está cacheado.
  // Garante que após logout+login o nome e as permissões reflitam o novo usuário.
  ionViewWillEnter(): void {
    this.refreshUserState();
  }

  private refreshUserState(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.userName = user.name || 'Usuário';
    this.isAdmin = this.authService.isAdmin();
    this.isEmployee = this.authService.isEmployee();
    this.isResident = this.authService.isResident();

    this.canCreateReservation = this.isAdmin || this.isResident;
    this.canCreateOccurrence = this.isAdmin || this.isResident;
    this.canManageDeliveries = this.isAdmin || this.isEmployee;
    this.canManageEquipment = this.isAdmin || this.isEmployee;
    this.canSeeReservationsSummary = this.isAdmin || this.isResident;

    this.loadStats();
  }

  private loadStats(): void {
    this.deliveryService.findAll().pipe(
      catchError(() => of([]))
    ).subscribe(deliveries => {
      this.pendingDeliveries = deliveries.filter((d: any) => d.status === 'PENDING').length;
    });

    if (this.canSeeReservationsSummary) {
      const currentUser = this.authService.getCurrentUser();
      // Admin vê o total de reservas aprovadas; resident vê apenas as suas
      const reservations$ = this.isAdmin
        ? this.reservationService.getAll()
        : this.reservationService.getByUser(currentUser!.id);

      reservations$.pipe(
        catchError(() => of([]))
      ).subscribe(reservations => {
        this.activeReservations = reservations.filter((r: any) => r.status === 'APPROVED').length;
        if (this.isAdmin) {
          this.pendingApprovals = reservations.filter((r: any) => r.status === 'PENDING').length;
        }
      });
    }
  }

  goToPendingApprovals(): void {
    this.router.navigate(['/tabs/reservations'], {
      queryParams: { view: 'all', status: 'PENDING' }
    });
  }

  openNewReservation(): void {
    this.router.navigate(['/reservations/new']);
  }

  openNewOccurrence(): void {
    this.router.navigate(['/occurrences/new']);
  }

  goToDeliveries(): void {
    this.router.navigate(['/tabs/deliveries']);
  }

  goToReservations(): void {
    this.router.navigate(['/tabs/reservations']);
  }

  openDeliveriesManagement(): void {
    this.router.navigate(['/deliveries']);
  }

  openEquipmentFlow(): void {
    this.router.navigate(['/equipment-reservations']);
  }

  openUsers(): void {
    this.router.navigate(['/users']);
  }

  openReports(): void {
    this.router.navigate(['/reports']);
  }

  logout(): void {
    this.authService.logout();
  }
}
