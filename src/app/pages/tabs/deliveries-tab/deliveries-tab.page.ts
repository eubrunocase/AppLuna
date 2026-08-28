import { Component, inject, OnInit } from '@angular/core';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryService } from '../../../services/delivery.service';
import { AuthService } from '../../../services/auth.service';
import { UiService } from '../../../shared/services/ui.service';
import { ResponseDeliveryDTO, DeliveryStatus } from '../../../core/models';
import { AppNavigationService } from '../../../core/navigation/app-navigation.service';
import { APP_ROUTES } from '../../../core/navigation/app-routes';
import { AppShellService } from '../../../core/shell/app-shell.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-deliveries-tab',
  template: `
    <ion-content class="shell-page-content ion-padding">
      <div class="tab-filters">
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
      </div>

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

              <ion-button
                *ngIf="canConfirm && delivery.status === 'PENDING'"
                size="small"
                color="success"
                class="confirm-btn"
                (click)="confirmReceipt(delivery)">
                <ion-icon slot="start" name="checkmark-done-outline"></ion-icon>
                Marcar como recebida
              </ion-button>
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

      <ion-fab vertical="bottom" horizontal="end" slot="fixed" *ngIf="canCreate">
        <ion-fab-button (click)="openCreate()">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    .skeleton-list { padding: 0; }

    .skeleton-card {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 12px;
    }

    .delivery-card { margin-bottom: 12px; }

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

    .delivery-icon.pending { background: var(--ion-color-warning); }

    .delivery-icon ion-icon { font-size: 24px; color: white; }
    .delivery-icon.pending ion-icon { color: #000; }

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

    .delivery-info p.with-icon { color: #fff8f0; }

    .icon-inline {
      font-size: 14px;
      color: rgba(255, 248, 240, 0.82);
      flex-shrink: 0;
    }

    .delivery-info p.with-icon .icon-inline { color: var(--ion-color-primary); }

    .delivery-info .picked-up {
      color: var(--ion-color-success);
      font-weight: 500;
    }

    .confirm-btn {
      margin-top: 10px;
      --border-radius: 8px;
    }

    ion-chip { flex-shrink: 0; }

    .chip-PENDING {
      --background: var(--ion-color-warning);
      --color: #000;
    }

    .chip-DELIVERED {
      --background: var(--ion-color-success);
      --color: #fff;
    }

    .tab-filters {
      margin: -0.5rem -1rem 0.75rem;
    }

    ion-fab {
      bottom: var(--app-fab-bottom, 5rem);
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DeliveriesTabPage implements OnInit, ViewWillEnter {
  private deliveryService = inject(DeliveryService);
  private authService = inject(AuthService);
  private uiService = inject(UiService);
  private navigation = inject(AppNavigationService);
  private shell = inject(AppShellService);

  deliveries: ResponseDeliveryDTO[] = [];
  filteredDeliveries: ResponseDeliveryDTO[] = [];
  isLoading = false;
  statusFilter: 'ALL' | 'PENDING' | 'DELIVERED' = 'ALL';
  canConfirm = false;
  canCreate = false;

  private currentUserId: string | null = null;

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserId = user?.id ?? null;
    this.canConfirm = this.authService.isResident();
    this.canCreate = this.authService.isAdmin() || this.authService.isEmployee();
    this.loadDeliveries();
  }

  ionViewWillEnter(): void {
    this.loadDeliveries();
    this.shell.configure({
      title: 'Minhas Entregas',
      showBack: false,
      showLogo: true,
      showLogout: true,
      headerState: 'compact',
      progressStep: null,
      progressTotal: null,
    });
    this.shell.setExpandContent(null);
  }

  loadDeliveries(): void {
    if (!this.currentUserId) return;

    this.isLoading = true;

    this.deliveryService.findByUser(this.currentUserId).pipe(
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

  async confirmReceipt(delivery: ResponseDeliveryDTO): Promise<void> {
    const confirmed = await this.uiService.showConfirm(
      'Confirmar Recebimento',
      'Deseja marcar esta encomenda como recebida?',
      'Sim, recebi',
      'Cancelar'
    );

    if (!confirmed) return;

    const currentUser = this.authService.getCurrentUser();
    const pickedUpBy = currentUser?.name ?? 'Morador';

    this.deliveryService.confirmReceipt(delivery.id, pickedUpBy).pipe(
      catchError(() => {
        this.uiService.showError('Erro ao confirmar recebimento');
        return of(null);
      })
    ).subscribe(async result => {
      if (result) {
        await this.uiService.showSuccess('Encomenda marcada como recebida!');
        this.loadDeliveries();
      }
    });
  }

  openCreate(): void {
    void this.navigation.push(APP_ROUTES.deliveriesNew);
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
