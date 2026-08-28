import { Component, inject, OnInit } from '@angular/core';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeliveryService } from '../../services/delivery.service';
import { UserService } from '../../services/user.service';
import { ResponseDeliveryDTO, UserSummaryDTO, DeliveryStatus, UserRoles } from '../../core/models';
import { AuthService } from '../../services/auth.service';
import { AlertController } from '@ionic/angular';
import { AppNavigationService } from '../../core/navigation/app-navigation.service';
import { APP_ROUTES } from '../../core/navigation/app-routes';
import { AppShellService } from '../../core/shell/app-shell.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-deliveries',
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
            <ion-label>Entregues</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
      </div>

      @if (canCreate) {
        <ion-button expand="block" class="create-top-btn" (click)="openCreateModal()">
          <ion-icon slot="start" name="add"></ion-icon>
          Nova encomenda
        </ion-button>
      }

      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div *ngIf="isLoading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <ion-list *ngIf="!isLoading && filteredDeliveries.length > 0">
        <ion-card *ngFor="let delivery of filteredDeliveries" class="delivery-card">
          <ion-card-header>
            <ion-card-subtitle>
              <ion-icon name="barcode-outline" class="card-icon"></ion-icon>
              {{ delivery.protocolNumber || 'Sem protocolo' }}
            </ion-card-subtitle>
            <ion-chip [color]="getStatusColor(delivery.status)" class="status-chip">
              {{ getStatusLabel(delivery.status) }}
            </ion-chip>
          </ion-card-header>
          
          <ion-card-content>
            <div class="delivery-info">
              <p><strong>Destinatário:</strong> {{ getUserName(delivery.user) }}</p>
              <p *ngIf="delivery.discrimination"><strong>Descrição:</strong> {{ delivery.discrimination }}</p>
              <p *ngIf="delivery.otherRecipient"><strong>Recebedor:</strong> {{ delivery.otherRecipient }}</p>
              <p class="date"><strong>Recebido em:</strong> {{ formatDate(delivery.createdAt) }}</p>
              <p *ngIf="delivery.deliveredAt" class="date">
                <strong>Entregue em:</strong> {{ formatDate(delivery.deliveredAt) }}
              </p>
              <p *ngIf="delivery.pickedUpBy" class="picked-up">
                <strong>Retirado por:</strong> {{ delivery.pickedUpBy }}
              </p>
            </div>
            
            <ion-button 
              *ngIf="canConfirm && delivery.status === 'PENDING'"
              expand="block" 
              color="success"
              (click)="confirmDelivery(delivery)">
              <ion-icon slot="start" name="checkmark-circle-outline"></ion-icon>
              Confirmar Retirada
            </ion-button>
          </ion-card-content>
        </ion-card>
      </ion-list>

      <div *ngIf="!isLoading && filteredDeliveries.length === 0" class="empty-state">
        <ion-icon name="cube-outline" class="empty-icon"></ion-icon>
        <p>Nenhuma entrega encontrada</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    
    .delivery-card {
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
    
    .status-chip {
      font-size: 12px;
    }
    
    .delivery-info p {
      margin: 4px 0;
      color: var(--ion-color-medium);
    }
    
    .delivery-info .date {
      font-size: 12px;
    }
    
    .delivery-info .picked-up {
      color: var(--ion-color-success);
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

    .tab-filters {
      margin: -0.5rem -1rem 0.75rem;
    }

    .create-top-btn {
      margin-bottom: 0.75rem;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DeliveriesPage implements OnInit, ViewWillEnter {
  private deliveryService = inject(DeliveryService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private alertController = inject(AlertController);
  private navigation = inject(AppNavigationService);
  private shell = inject(AppShellService);
  private router = inject(Router);

  deliveries: ResponseDeliveryDTO[] = [];
  filteredDeliveries: ResponseDeliveryDTO[] = [];
  users: UserSummaryDTO[] = [];
  isLoading = false;
  statusFilter: 'ALL' | 'PENDING' | 'DELIVERED' = 'ALL';

  canCreate = false;
  canConfirm = false;

  ngOnInit(): void {
    this.setupPermissions();
    this.loadData();
  }

  ionViewWillEnter(): void {
    this.shell.configure({
      title: 'Entregas',
      showBack: true,
      showLogo: false,
      showLogout: false,
      headerState: 'compact',
    });
    this.shell.setExpandContent(null);
  }

  private isHomeStack(): boolean {
    return this.router.url.includes('/app/home/');
  }

  private createRoute(): string {
    return this.isHomeStack() ? APP_ROUTES.homeDeliveriesNew : APP_ROUTES.deliveriesNew;
  }

  private setupPermissions(): void {
    const role = this.authService.getCurrentUser()?.role;
    this.canCreate = role === UserRoles.ADMIN_ROLE || role === UserRoles.EMPLOYEE;
    this.canConfirm = this.canCreate;
  }

  loadData(): void {
    this.isLoading = true;
    
    this.userService.getSummary().pipe(
      catchError(() => of([]))
    ).subscribe(users => {
      this.users = users;
    });

    this.deliveryService.findAll().pipe(
      catchError(() => of([])),
      finalize(() => this.isLoading = false)
    ).subscribe(deliveries => {
      this.deliveries = deliveries;
      this.filterByStatus();
    });
  }

  refresh(event: any): void {
    this.loadData();
    setTimeout(() => event.target.complete(), 1000);
  }

  filterByStatus(): void {
    if (this.statusFilter === 'ALL') {
      this.filteredDeliveries = [...this.deliveries];
    } else {
      this.filteredDeliveries = this.deliveries.filter(d => d.status === this.statusFilter);
    }
  }

  getUserName(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user?.name || userId;
  }

  getStatusColor(status: DeliveryStatus): string {
    return status === DeliveryStatus.DELIVERED ? 'success' : 'warning';
  }

  getStatusLabel(status: DeliveryStatus): string {
    return status === DeliveryStatus.DELIVERED ? 'Entregue' : 'Pendente';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR');
  }

  async confirmDelivery(delivery: ResponseDeliveryDTO): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirmar Retirada',
      message: 'Informe o nome de quem está retirando:',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nome completo'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: (data) => {
            if (data.name) {
              this.doConfirm(delivery.id, data.name);
              return true;
            }
            return false;
          }
        }
      ]
    });
    await alert.present();
  }

  private doConfirm(id: string, pickedUpBy: string): void {
    this.deliveryService.confirmReceipt(id, pickedUpBy).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      this.loadData();
    });
  }

  openCreateModal(): void {
    void this.navigation.push(this.createRoute());
  }
}
