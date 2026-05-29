import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ReservationService } from '../../services/reservation.service';
import { DeliveryService } from '../../services/delivery.service';
import { EquipmentReservationService } from '../../services/equipment-reservation.service';
import { UserRoles, EquipmentReservationStatus } from '../../core/models';
import { catchError, finalize, of } from 'rxjs';

interface DashboardStats {
  pendingReservations: number;
  pendingDeliveries: number;
  activeEquipmentLoans: number;
  totalUsers: number;
}

@Component({
  selector: 'app-home',
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
        <p>{{ userRoleLabel }}</p>
      </div>

      <div *ngIf="isAdmin || isEmployee" class="stats-section">
        <h3 class="section-title">Resumo do Dia</h3>
        <div class="stats-grid">
          <ion-card class="stat-card" (click)="navigateTo('/reservations')">
            <ion-card-content>
              <ion-icon name="calendar-outline" class="stat-icon" style="color: #2196F3;"></ion-icon>
              <div class="stat-info">
                <span class="stat-value">{{ stats.pendingReservations }}</span>
                <span class="stat-label">Reservas Pendentes</span>
              </div>
            </ion-card-content>
          </ion-card>
          
          <ion-card class="stat-card" (click)="navigateTo('/deliveries')">
            <ion-card-content>
              <ion-icon name="cube-outline" class="stat-icon" style="color: #4CAF50;"></ion-icon>
              <div class="stat-info">
                <span class="stat-value">{{ stats.pendingDeliveries }}</span>
                <span class="stat-label">Entregas</span>
              </div>
            </ion-card-content>
          </ion-card>
          
          <ion-card class="stat-card" (click)="navigateTo('/equipment-reservations')">
            <ion-card-content>
              <ion-icon name="tv-outline" class="stat-icon" style="color: #FF9800;"></ion-icon>
              <div class="stat-info">
                <span class="stat-value">{{ stats.activeEquipmentLoans }}</span>
                <span class="stat-label">Empréstimos Ativos</span>
              </div>
            </ion-card-content>
          </ion-card>
          
          <ion-card *ngIf="isAdmin" class="stat-card" (click)="navigateTo('/users')">
            <ion-card-content>
              <ion-icon name="people-outline" class="stat-icon" style="color: #9C27B0;"></ion-icon>
              <div class="stat-info">
                <span class="stat-value">{{ stats.totalUsers }}</span>
                <span class="stat-label">Usuários</span>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <div class="menu-section">
        <h3 class="section-title">Ações Rápidas</h3>
        
        <ion-card class="menu-card" (click)="navigateTo('/reservations')">
          <ion-card-content>
            <ion-icon name="calendar-outline" style="color: #2196F3;"></ion-icon>
            <div class="menu-content">
              <ion-card-title>Reservas de Espaços</ion-card-title>
              <ion-card-subtitle>Salão de Festas, Churrasqueira e mais</ion-card-subtitle>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card class="menu-card" (click)="navigateTo('/deliveries')">
          <ion-card-content>
            <ion-icon name="cube-outline" style="color: #4CAF50;"></ion-icon>
            <div class="menu-content">
              <ion-card-title>Entregas</ion-card-title>
              <ion-card-subtitle>Registro e retirada de encomendas</ion-card-subtitle>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card class="menu-card" (click)="navigateTo('/equipment-reservations')">
          <ion-card-content>
            <ion-icon name="tv-outline" style="color: #FF9800;"></ion-icon>
            <div class="menu-content">
              <ion-card-title>Empréstimo de Equipamentos</ion-card-title>
              <ion-card-subtitle>TV Comunitária e outros itens</ion-card-subtitle>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card class="menu-card" (click)="navigateTo('/occurrences')">
          <ion-card-content>
            <ion-icon name="alert-circle-outline" style="color: #F44336;"></ion-icon>
            <div class="menu-content">
              <ion-card-title>Ocorrências</ion-card-title>
              <ion-card-subtitle>Livro Negro Digital</ion-card-subtitle>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card class="menu-card" (click)="navigateTo('/push-notifications')">
          <ion-card-content>
            <ion-icon name="notifications-outline" style="color: #00BCD4;"></ion-icon>
            <div class="menu-content">
              <ion-card-title>Notificações</ion-card-title>
              <ion-card-subtitle>Push notifications via Web</ion-card-subtitle>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card *ngIf="isAdmin" class="menu-card" (click)="navigateTo('/reports')">
          <ion-card-content>
            <ion-icon name="document-text-outline" style="color: #607D8B;"></ion-icon>
            <div class="menu-content">
              <ion-card-title>Relatórios</ion-card-title>
              <ion-card-subtitle>Relatório mensal de reservas</ion-card-subtitle>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card *ngIf="isAdmin" class="menu-card" (click)="navigateTo('/users')">
          <ion-card-content>
            <ion-icon name="people-outline" style="color: #9C27B0;"></ion-icon>
            <div class="menu-content">
              <ion-card-title>Usuários</ion-card-title>
              <ion-card-subtitle>Gerenciar moradores e funcionários</ion-card-subtitle>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .welcome-section {
      text-align: center;
      margin-bottom: 24px;
      padding: 24px;
      background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%);
      border-radius: 16px;
      color: white;
    }
    
    .welcome-section h2 {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: bold;
    }
    
    .welcome-section p {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--ion-color-medium);
      margin: 0 0 12px 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .stats-section {
      margin-bottom: 24px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    
    .stat-card {
      margin: 0;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      cursor: pointer;
    }
    
    .stat-card ion-card-content {
      display: flex;
      align-items: center;
      padding: 16px;
    }
    
    .stat-icon {
      font-size: 32px;
      margin-right: 12px;
    }
    
    .stat-info {
      display: flex;
      flex-direction: column;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: var(--ion-color-dark);
    }
    
    .stat-label {
      font-size: 11px;
      color: var(--ion-color-medium);
    }
    
    .menu-section {
      margin-top: 8px;
    }
    
    .menu-card {
      margin: 0 0 12px 0;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .menu-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }
    
    .menu-card ion-card-content {
      display: flex;
      align-items: center;
      padding: 16px;
    }
    
    .menu-card ion-icon {
      font-size: 36px;
      margin-right: 16px;
    }
    
    .menu-content {
      flex: 1;
    }
    
    .menu-content ion-card-title {
      font-size: 16px;
      color: var(--ion-color-dark);
      margin-bottom: 4px;
    }
    
    .menu-content ion-card-subtitle {
      font-size: 12px;
      color: var(--ion-color-medium);
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HomePage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private reservationService = inject(ReservationService);
  private deliveryService = inject(DeliveryService);
  private equipmentService = inject(EquipmentReservationService);
  private userService = inject(UserService);

  userName = 'Usuário';
  userRole = '';
  isAdmin = false;
  isEmployee = false;

  stats: DashboardStats = {
    pendingReservations: 0,
    pendingDeliveries: 0,
    activeEquipmentLoans: 0,
    totalUsers: 0
  };

  get userRoleLabel(): string {
    if (this.isAdmin) return 'Administrador';
    if (this.isEmployee) return 'Funcionário';
    return 'Morador';
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadStats();
  }

  private loadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.name;
      this.userRole = user.role;
      this.isAdmin = user.role === UserRoles.ADMIN_ROLE;
      this.isEmployee = user.role === UserRoles.EMPLOYEE;
    }
  }

  private loadStats(): void {
    if (!this.isAdmin && !this.isEmployee) return;

    this.reservationService.getAll().pipe(
      catchError(() => of([]))
    ).subscribe(reservations => {
      this.stats.pendingReservations = reservations.filter(r => r.status === 'PENDING').length;
    });

    this.deliveryService.findAll().pipe(
      catchError(() => of([]))
    ).subscribe(deliveries => {
      this.stats.pendingDeliveries = deliveries.filter(d => d.status === 'PENDING').length;
    });

    this.equipmentService.list({ status: EquipmentReservationStatus.IN_USE }).pipe(
      catchError(() => of([]))
    ).subscribe(equipment => {
      this.stats.activeEquipmentLoans = equipment.length;
    });

    if (this.isAdmin) {
      this.userService.getAll().pipe(
        catchError(() => of([]))
      ).subscribe(users => {
        this.stats.totalUsers = users.length;
      });
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
  }
}
