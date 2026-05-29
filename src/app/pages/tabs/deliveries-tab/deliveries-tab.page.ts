import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryService } from '../../../services/delivery.service';
import { UserService } from '../../../services/user.service';
import { ResponseDeliveryDTO, DeliveryStatus } from '../../../core/models';
import { UiService } from '../../../shared/services/ui.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-deliveries-tab',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Minhas Entregas</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment [(ngModel)]="statusFilter" (ionChange)="filterByStatus()">
          <ion-segment-button value="ALL">
            <ion-label>Todas</ion-label>
          </ion-segment-button>
          <ion-segment-button value="PENDING">
            <ion-label>Pendentes</ion-label>
          </ion-segment-button>
          <ion-segment-button value="DELIVERED">
            <ion-label>Retiradas</ion-label>
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
          <ion-skeleton-text animated style="width: 40%; height: 16px;"></ion-skeleton-text>
          <ion-skeleton-text animated style="width: 80%; height: 20px; margin-top: 8px;"></ion-skeleton-text>
          <ion-skeleton-text animated style="width: 60%; height: 14px; margin-top: 8px;"></ion-skeleton-text>
        </div>
      </div>

      <ion-list *ngIf="!isLoading && filteredDeliveries.length > 0">
        <ion-card *ngFor="let delivery of filteredDeliveries" class="delivery-card">
          <ion-card-content>
            <div class="delivery-icon" [class.pending]="delivery.status === 'PENDING'">
              <ion-icon name="cube-outline"></ion-icon>
            </div>
            
            <div class="delivery-info">
              <h3>{{ delivery.discrimination || 'Encomenda' }}</h3>
              <p *ngIf="delivery.protocolNumber" class="with-icon">
                <ion-icon name="barcode-outline" class="icon-inline"></ion-icon>
                {{ delivery.protocolNumber }}
              </p>
              <p class="date">
                <ion-icon name="time-outline" class="icon-inline"></ion-icon>
                {{ formatDate(delivery.createdAt) }}
              </p>
              <p *ngIf="delivery.pickedUpBy" class="picked-up">
                <ion-icon name="checkmark-circle-outline" class="icon-inline"></ion-icon>
                Retirado por {{ delivery.pickedUpBy }}
              </p>
            </div>
            
            <ion-chip [class]="'chip-' + getStatusClass(delivery.status)">
              {{ getStatusLabel(delivery.status) }}
            </ion-chip>
          </ion-card-content>
        </ion-card>
      </ion-list>

      <div *ngIf="!isLoading && filteredDeliveries.length === 0" class="empty-state">
        <ion-icon name="cube-outline" class="empty-icon"></ion-icon>
        <p class="empty-title">Nenhuma entrega</p>
        <p class="empty-message">Suas encomendas aparecerão aqui</p>
      </div>
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
    
    .delivery-card {
      margin-bottom: 12px;
    }
    
    .delivery-card ion-card-content {
      display: flex;
      align-items: flex-start;
      padding: 16px;
    }
    
    .delivery-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: var(--ion-color-success);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      flex-shrink: 0;
    }
    
    .delivery-icon.pending {
      background: var(--ion-color-warning);
    }
    
    .delivery-icon ion-icon {
      font-size: 24px;
      color: white;
    }
    
    .delivery-icon.pending ion-icon {
      color: #000;
    }
    
    .delivery-info {
      flex: 1;
      min-width: 0;
    }
    
    .delivery-info h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: #fff8f0;
    }
    
    .delivery-info p {
      margin: 0 0 2px 0;
      font-size: 13px;
      color: rgba(255, 248, 240, 0.82);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .delivery-info p.with-icon {
      color: #fff8f0;
    }
    
    .icon-inline {
      font-size: 14px;
      color: rgba(255, 248, 240, 0.82);
      flex-shrink: 0;
    }
    
    .delivery-info p.with-icon .icon-inline {
      color: var(--ion-color-primary);
    }
    
    .delivery-info .picked-up {
      color: var(--ion-color-success);
      font-weight: 500;
    }
    
    ion-chip {
      flex-shrink: 0;
    }
    
    .chip-PENDING {
      --background: var(--ion-color-warning);
      --color: #000;
    }
    
    .chip-DELIVERED {
      --background: var(--ion-color-success);
      --color: #fff;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DeliveriesTabPage implements OnInit {
  private deliveryService = inject(DeliveryService);
  private uiService = inject(UiService);

  deliveries: ResponseDeliveryDTO[] = [];
  filteredDeliveries: ResponseDeliveryDTO[] = [];
  isLoading = false;
  statusFilter: 'ALL' | 'PENDING' | 'DELIVERED' = 'ALL';

  ngOnInit(): void {
    this.loadDeliveries();
  }

  loadDeliveries(): void {
    this.isLoading = true;
    
    this.deliveryService.findAll().pipe(
      catchError(() => of([])),
      finalize(() => this.isLoading = false)
    ).subscribe(deliveries => {
      this.deliveries = deliveries;
      this.filterByStatus();
    });
  }

  refresh(event: any): void {
    this.loadDeliveries();
    setTimeout(() => event.target.complete(), 1000);
  }

  filterByStatus(): void {
    if (this.statusFilter === 'ALL') {
      this.filteredDeliveries = [...this.deliveries];
    } else {
      this.filteredDeliveries = this.deliveries.filter(d => d.status === this.statusFilter);
    }
  }

  getStatusLabel(status: DeliveryStatus): string {
    return status === DeliveryStatus.DELIVERED ? 'Retirada' : 'Pendente';
  }

  getStatusClass(status: DeliveryStatus): string {
    return status === DeliveryStatus.PENDING ? 'PENDING' : 'DELIVERED';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR') + ' às ' + 
           date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}
