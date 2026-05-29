import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AlertController } from '@ionic/angular';
import { EquipmentReservationService } from '../../services/equipment-reservation.service';
import { EquipmentReservationResponseDTO, EquipmentReservationStatus, UserRoles } from '../../core/models';
import { AuthService } from '../../services/auth.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-equipment-reservations',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Empréstimo de Equipamentos</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="openCreateModal()">
            <ion-icon slot="icon-only" name="add"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div *ngIf="isLoading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <ion-list *ngIf="!isLoading && reservations.length > 0">
        <ion-card *ngFor="let reservation of reservations" class="equipment-card">
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="tv-outline" class="card-icon"></ion-icon>
              {{ reservation.equipmentName }}
            </ion-card-title>
            <ion-chip [color]="getStatusColor(reservation.status)">
              {{ getStatusLabel(reservation.status) }}
            </ion-chip>
          </ion-card-header>
          
          <ion-card-content>
            <div class="equipment-info">
              <p><strong>Solicitante:</strong> {{ reservation.userName }} ({{ reservation.userApartment }})</p>
              <p><strong>Data:</strong> {{ formatDate(reservation.date) }}</p>
              <p><strong>Horário:</strong> {{ reservation.startTime }} - {{ reservation.endTime }}</p>
              <p class="date"><strong>Criado em:</strong> {{ formatDateTime(reservation.createdAt) }}</p>
            </div>
            
            <div *ngIf="isAdmin" class="action-buttons">
              <ng-container [ngSwitch]="reservation.status">
                <ion-button 
                  *ngSwitchCase="'CONFIRMED'"
                  expand="block" 
                  color="primary"
                  (click)="handover(reservation)">
                  <ion-icon slot="start" name="hand-right-outline"></ion-icon>
                  Entregar
                </ion-button>
                <ion-button 
                  *ngSwitchCase="'IN_USE'"
                  expand="block" 
                  color="success"
                  (click)="returnItem(reservation)">
                  <ion-icon slot="start" name="checkmark-circle-outline"></ion-icon>
                  Devolver
                </ion-button>
              </ng-container>
            </div>
          </ion-card-content>
        </ion-card>
      </ion-list>

      <div *ngIf="!isLoading && reservations.length === 0" class="empty-state">
        <ion-icon name="tv-outline" class="empty-icon"></ion-icon>
        <p>Nenhum empréstimo encontrado</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    
    .equipment-card {
      margin-bottom: 16px;
      border-radius: 12px;
    }
    
    ion-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    ion-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
    }
    
    .card-icon {
      color: var(--ion-color-primary);
      font-size: 20px;
    }
    
    .equipment-info p {
      margin: 4px 0;
      color: var(--ion-color-medium);
    }
    
    .action-buttons {
      margin-top: 12px;
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
  imports: [IonicModule, CommonModule]
})
export class EquipmentReservationsPage implements OnInit {
  private equipmentService = inject(EquipmentReservationService);
  private authService = inject(AuthService);
  private alertController = inject(AlertController);

  reservations: EquipmentReservationResponseDTO[] = [];
  isLoading = false;
  isAdmin = false;

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading = true;
    
    this.equipmentService.list().pipe(
      catchError(() => of([])),
      finalize(() => this.isLoading = false)
    ).subscribe(reservations => {
      this.reservations = reservations;
    });
  }

  refresh(event: any): void {
    this.loadReservations();
    setTimeout(() => event.target.complete(), 1000);
  }

  getStatusColor(status: EquipmentReservationStatus): string {
    const colors: Record<EquipmentReservationStatus, string> = {
      [EquipmentReservationStatus.CONFIRMED]: 'primary',
      [EquipmentReservationStatus.IN_USE]: 'warning',
      [EquipmentReservationStatus.RETURNED]: 'success',
      [EquipmentReservationStatus.CANCELED]: 'medium'
    };
    return colors[status] || 'medium';
  }

  getStatusLabel(status: EquipmentReservationStatus): string {
    const labels: Record<EquipmentReservationStatus, string> = {
      [EquipmentReservationStatus.CONFIRMED]: 'Confirmado',
      [EquipmentReservationStatus.IN_USE]: 'Em Uso',
      [EquipmentReservationStatus.RETURNED]: 'Devolvido',
      [EquipmentReservationStatus.CANCELED]: 'Cancelado'
    };
    return labels[status] || status;
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
      header: 'Novo Empréstimo',
      inputs: [
        {
          name: 'equipmentId',
          type: 'number',
          placeholder: 'ID do Equipamento'
        },
        {
          name: 'date',
          type: 'date',
          placeholder: 'Data'
        },
        {
          name: 'startTime',
          type: 'time',
          placeholder: 'Hora início'
        },
        {
          name: 'endTime',
          type: 'time',
          placeholder: 'Hora fim'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Reservar',
          handler: (data) => {
            if (data.equipmentId && data.date && data.startTime && data.endTime) {
              this.createReservation(data);
              return true;
            }
            return false;
          }
        }
      ]
    });
    await alert.present();
  }

  private createReservation(data: any): void {
    this.equipmentService.create({
      equipmentId: parseInt(data.equipmentId),
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime
    }).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      this.loadReservations();
    });
  }

  handover(reservation: EquipmentReservationResponseDTO): void {
    this.equipmentService.handover(reservation.id).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      this.loadReservations();
    });
  }

  returnItem(reservation: EquipmentReservationResponseDTO): void {
    this.equipmentService.returnItem(reservation.id).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      this.loadReservations();
    });
  }
}
