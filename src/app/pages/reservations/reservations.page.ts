import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';
import { ReservationResponseDTO, ReservationStatus, UserRoles } from '../../core/models';
import { AuthService } from '../../services/auth.service';
import { AlertController, ToastController } from '@ionic/angular';
import { catchError, finalize, of, Subscription } from 'rxjs';

@Component({
  selector: 'app-reservations',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Reservas de Espaços</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="openCreateModal()">
            <ion-icon slot="icon-only" name="add"></ion-icon>
          </ion-button>
        </ion-buttons>
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
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div *ngIf="isLoading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <ion-list *ngIf="!isLoading && filteredReservations.length > 0">
        <ion-card *ngFor="let reservation of filteredReservations" class="reservation-card">
          <ion-card-header>
            <ion-card-subtitle>
              <ion-icon name="calendar-outline" class="card-icon"></ion-icon>
              {{ formatDate(reservation.date) }}
            </ion-card-subtitle>
            <ion-chip [color]="getStatusColor(reservation.status)">
              {{ getStatusLabel(reservation.status) }}
            </ion-chip>
          </ion-card-header>
          
          <ion-card-content>
            <div class="reservation-info">
              <p><strong>Espaço:</strong> {{ getSpaceTypeLabel(reservation.space.type) }}</p>
              <p><strong>Solicitante:</strong> {{ reservation.user.name }}</p>
              <p class="date"><strong>Criado em:</strong> {{ formatDateTime(reservation.createdAt) }}</p>
            </div>
            
            <div *ngIf="isAdmin && reservation.status === 'PENDING'" class="action-buttons">
              <ion-button expand="block" color="success" (click)="approveReservation(reservation)">
                <ion-icon slot="start" name="checkmark"></ion-icon>
                Aprovar
              </ion-button>
              <ion-button expand="block" color="danger" fill="outline" (click)="rejectReservation(reservation)">
                <ion-icon slot="start" name="close"></ion-icon>
                Rejeitar
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </ion-list>

      <div *ngIf="!isLoading && filteredReservations.length === 0" class="empty-state">
        <ion-icon name="calendar-outline" class="empty-icon"></ion-icon>
        <p>Nenhuma reserva encontrada</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    
    .reservation-card {
      margin-bottom: 16px;
      border-radius: 12px;
    }
    
    ion-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    ion-card-subtitle {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .card-icon {
      color: var(--ion-color-primary);
      font-size: 16px;
    }
    
    .reservation-info p {
      margin: 4px 0;
      color: var(--ion-color-medium);
    }
    
    .action-buttons {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
    
    .action-buttons ion-button {
      flex: 1;
    }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      color: var(--ion-color-medium);
    }
    
    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, FormsModule]
})
export class ReservationsPage implements OnInit, OnDestroy {
  private reservationService = inject(ReservationService);
  private authService = inject(AuthService);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  reservations: ReservationResponseDTO[] = [];
  filteredReservations: ReservationResponseDTO[] = [];
  isLoading = false;
  statusFilter: 'ALL' | 'PENDING' | 'APPROVED' = 'ALL';
  isAdmin = false;
  private refreshSub?: Subscription;

  spaceTypes: Record<string, string> = {
    'SALAO_FESTAS': 'Salão de Festas',
    'CHURRASQUEIRA': 'Churrasqueira',
    'ACADEMIA': 'Academia',
    'CAMPO_FUTEBOL': 'Campo de Futebol'
  };

  ngOnInit(): void {
    this.loadReservations();
    this.refreshSub = this.reservationService.reservationUpdated$.subscribe(() => {
      this.loadReservationsBackground();
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
  }

  ionViewWillEnter(): void {
    this.loadReservations();
  }

  loadReservationsBackground(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const reservations$ = this.isAdmin
      ? this.reservationService.getAll()
      : this.reservationService.getByUser(currentUser.id);

    reservations$.pipe(
      catchError(() => of([]))
    ).subscribe(reservations => {
      this.reservations = reservations;
      this.filterByStatus();
    });
  }

  loadReservations(): void {
    this.isLoading = true;
    this.isAdmin = this.authService.isAdmin();
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.isLoading = false;
      return;
    }

    const reservations$ = this.isAdmin
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

  getStatusColor(status: ReservationStatus): string {
    const colors: Record<ReservationStatus, string> = {
      [ReservationStatus.PENDING]: 'warning',
      [ReservationStatus.APPROVED]: 'success',
      [ReservationStatus.REJECTED]: 'danger',
      [ReservationStatus.CANCELLED]: 'medium'
    };
    return colors[status] || 'medium';
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

  getSpaceTypeLabel(type: string): string {
    return this.spaceTypes[type] || type;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR');
  }

  async openCreateModal(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Nova Reserva',
      inputs: [
        {
          name: 'space',
          type: 'number',
          placeholder: 'ID do Espaço (1-Salão, 2-Churrasqueira...)'
        },
        {
          name: 'date',
          type: 'date',
          placeholder: 'Data (YYYY-MM-DD)'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Reservar',
          handler: (data) => {
            if (data.space && data.date) {
              this.createReservation(parseInt(data.space), data.date);
              return true;
            }
            return false;
          }
        }
      ]
    });
    await alert.present();
  }

  private createReservation(space: number, date: string): void {
    this.reservationService.create({ space, date }).pipe(
      catchError(() => {
        this.toastController.create({
          message: 'Erro ao criar reserva. Verifique os dados e tente novamente.',
          duration: 3000,
          color: 'danger',
          position: 'bottom'
        }).then(toast => toast.present());
        return of(null);
      })
    ).subscribe(result => {
      if (result !== null) {
        this.toastController.create({
          message: 'Reserva solicitada com sucesso!',
          duration: 2500,
          color: 'success',
          position: 'bottom'
        }).then(toast => toast.present());
        // reservationUpdated$ dispara via tap no service, atualizando a lista sem spinner
      }
    });
  }

  approveReservation(reservation: ReservationResponseDTO): void {
    this.reservationService.approve(reservation.id).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      this.loadReservations();
    });
  }

  async rejectReservation(reservation: ReservationResponseDTO): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Rejeitar Reserva',
      message: `Deseja realmente rejeitar a reserva de ${reservation.user.name}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Rejeitar',
          role: 'destructive',
          handler: () => {
            this.reservationService.reject(reservation.id).pipe(
              catchError(() => of(null))
            ).subscribe(() => {
              this.loadReservations();
            });
          }
        }
      ]
    });
    await alert.present();
  }
}