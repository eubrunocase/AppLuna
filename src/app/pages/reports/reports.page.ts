import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';
import { MonthlyReservationReportDTO, ReportExportStatus, ReportFormat } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EMPTY, Subscription, catchError, finalize, interval, of, startWith, switchMap, takeWhile } from 'rxjs';

@Component({
  selector: 'app-reports',
  template: `
    <app-page-header title="Relatório de Reservas" [showBack]="true" backHref="/tabs/home" />

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

      <ion-card class="export-card">
        <ion-card-content>
          <ion-label class="export-title">Exportar relatório</ion-label>
          <div class="export-actions">
            <ion-button color="secondary" expand="block" [disabled]="isExporting || isLoading"
              (click)="exportReport(ReportFormat.PDF)">
              <ion-icon name="document-outline" slot="start"></ion-icon>
              PDF
            </ion-button>
            <ion-button color="secondary" expand="block" [disabled]="isExporting || isLoading"
              (click)="exportReport(ReportFormat.DOCX)">
              <ion-icon name="document-text-outline" slot="start"></ion-icon>
              DOCX
            </ion-button>
          </div>
          <div *ngIf="isExporting" class="export-status">
            <ion-spinner name="crescent" color="secondary"></ion-spinner>
            <p>Gerando relatório, aguarde...</p>
          </div>
          <p *ngIf="exportError" class="export-error">{{ exportError }}</p>
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

    .export-card {
      margin-bottom: 16px;
      border-radius: 12px;
    }

    .export-title {
      font-size: 14px;
      font-weight: 600;
      display: block;
      margin-bottom: 12px;
    }

    .export-actions {
      display: flex;
      gap: 8px;
    }

    .export-actions ion-button {
      flex: 1;
      margin: 0;
    }

    .export-status {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 12px 0 4px;
      color: rgba(255, 248, 240, 0.82);
    }

    .export-status p {
      margin: 0;
      font-size: 13px;
    }

    .export-error {
      color: #ff6b6b;
      font-size: 13px;
      margin: 8px 0 0;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PageHeaderComponent]
})
export class ReportsPage implements OnInit, OnDestroy {
  private reservationService = inject(ReservationService);
  private toastController = inject(ToastController);

  report: MonthlyReservationReportDTO[] = [];
  isLoading = false;
  initialLoad = true;

  isExporting = false;
  exportError = '';

  readonly ReportFormat = ReportFormat;

  private exportSub: Subscription | undefined;
  private readonly exportPollIntervalMs = 1500;
  private readonly exportTimeoutMs = 5 * 60 * 1000;

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

  ngOnDestroy(): void {
    this.exportSub?.unsubscribe();
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

  exportReport(format: ReportFormat): void {
    if (this.isExporting || this.isLoading) {
      return;
    }

    this.isExporting = true;
    this.exportError = '';

    this.exportSub = this.reservationService
      .createMonthlyReportExport(this.selectedMonth, this.selectedYear, format)
      .pipe(
        switchMap(job => this.pollUntilReady(job, format)),
        finalize(() => this.isExporting = false)
      )
      .subscribe({
        next: blob => this.downloadReport(blob, format),
        error: (err: unknown) => {
          this.exportError = this.extractErrorMessage(err);
          void this.presentToast(this.exportError, 'danger');
        }
      });
  }

  private pollUntilReady(job: { jobId: string; status: ReportExportStatus },
                         format: ReportFormat) {
    const startedAt = Date.now();
    return interval(this.exportPollIntervalMs).pipe(
      startWith(0),
      switchMap(() => this.reservationService.getMonthlyReportExportStatus(job.jobId)),
      takeWhile(
        current => current.status === ReportExportStatus.PROCESSING
          && Date.now() - startedAt < this.exportTimeoutMs,
        true
      ),
      switchMap(current => {
        if (Date.now() - startedAt >= this.exportTimeoutMs) {
          throw new Error('Tempo de geração do relatório excedido.');
        }
        if (current.status === ReportExportStatus.ERROR) {
          throw new Error(current.errorMessage || 'Falha ao gerar o relatório.');
        }
        if (current.status === ReportExportStatus.READY) {
          return this.reservationService.downloadMonthlyReportExport(current.jobId);
        }
        return EMPTY;
      })
    );
  }

  private downloadReport(blob: Blob, format: ReportFormat): void {
    const fileName = `relatorio-reservas-${this.padMonth(this.selectedMonth)}-${this.selectedYear}.${format.toLowerCase()}`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    void this.presentToast('Relatório exportado com sucesso.', 'success');
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof Error) {
      return err.message;
    }
    return 'Não foi possível exportar o relatório.';
  }

  private padMonth(month: number): string {
    return month.toString().padStart(2, '0');
  }

  private async presentToast(message: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
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
