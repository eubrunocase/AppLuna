import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';
import { MonthlyReservationReportDTO } from '../../core/models';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-reports',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Relatório de Reservas</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card class="filter-card">
        <ion-card-content>
          <ion-list lines="none">
            <ion-item>
              <ion-select 
                label="Mês" 
                labelPlacement="floating"
                [(ngModel)]="selectedMonth"
                (ionChange)="loadReport()">
                <ion-select-option *ngFor="let month of months" [value]="month.value">
                  {{ month.label }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-input 
                label="Ano" 
                labelPlacement="floating"
                type="number"
                [(ngModel)]="selectedYear"
                (ionChange)="loadReport()">
              </ion-input>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <div *ngIf="isLoading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <div *ngIf="!isLoading && report.length > 0" class="report-summary">
        <ion-card class="summary-card">
          <ion-card-content>
            <h2>Total de Reservas</h2>
            <p class="total">{{ report.length }}</p>
          </ion-card-content>
        </ion-card>
      </div>

      <ion-list *ngIf="!isLoading && report.length > 0">
        <ion-list-header>
          <ion-label>Reservas do Mês</ion-label>
        </ion-list-header>
        
        <ion-item *ngFor="let item of report" class="report-item">
          <ion-icon name="calendar-outline" slot="start" color="primary"></ion-icon>
          <ion-label>
            <h3>{{ item.residentName }}</h3>
            <p>{{ item.apartment }} - {{ getSpaceTypeLabel(item.spaceType) }}</p>
            <p class="date">{{ formatDate(item.date) }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <div *ngIf="!isLoading && report.length === 0 && !initialLoad" class="empty-state">
        <ion-icon name="document-text-outline" class="empty-icon"></ion-icon>
        <p>Nenhuma reserva neste período</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .filter-card {
      margin-bottom: 16px;
      border-radius: 12px;
    }
    
    ion-item {
      --background: rgba(255, 255, 255, 0.16);
      --border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.24);
      margin-bottom: 8px;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    
    .report-summary {
      margin-bottom: 16px;
    }
    
    .summary-card {
      background: rgba(255, 122, 0, 0.78);
      color: #1d1109;
      border-radius: 12px;
    }
    
    .summary-card h2 {
      font-size: 14px;
      margin: 0;
      opacity: 0.9;
    }
    
    .summary-card .total {
      font-size: 48px;
      font-weight: bold;
      margin: 8px 0 0 0;
    }
    
    .report-item h3 {
      font-weight: 600;
    }
    
    .report-item p {
      color: rgba(255, 248, 240, 0.82);
      font-size: 13px;
    }
    
    .report-item .date {
      font-size: 12px;
      margin-top: 4px;
    }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      color: rgba(255, 248, 240, 0.82);
    }
    
    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ReportsPage implements OnInit {
  private reservationService = inject(ReservationService);

  report: MonthlyReservationReportDTO[] = [];
  isLoading = false;
  initialLoad = true;

  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();

  months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  spaceTypes: Record<string, string> = {
    'SALAO_FESTAS': 'Salão de Festas',
    'CHURRASQUEIRA': 'Churrasqueira',
    'ACADEMIA': 'Academia',
    'CAMPO_FUTEBOL': 'Campo de Futebol'
  };

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.isLoading = true;
    this.initialLoad = false;

    this.reservationService.getMonthlyReport(this.selectedMonth, this.selectedYear).pipe(
      catchError(() => of([])),
      finalize(() => this.isLoading = false)
    ).subscribe(report => {
      this.report = report;
    });
  }

  getSpaceTypeLabel(type: string): string {
    return this.spaceTypes[type] || type;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  }
}
