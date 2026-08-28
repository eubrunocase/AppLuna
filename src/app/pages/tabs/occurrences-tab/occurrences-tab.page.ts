import { Component, inject, OnInit } from '@angular/core';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { UiService } from '../../../shared/services/ui.service';
import { OccurrenceService } from '../../../services/occurrence.service';
import { OccurrenceResponseDTO } from '../../../core/models';
import { AppNavigationService } from '../../../core/navigation/app-navigation.service';
import { APP_ROUTES } from '../../../core/navigation/app-routes';
import { AppShellService } from '../../../core/shell/app-shell.service';
import { catchError, finalize, of } from 'rxjs';

type Occurrence = OccurrenceResponseDTO;

@Component({
  selector: 'app-occurrences-tab',
  template: `
    <ion-content class="shell-page-content ion-padding">
      <div class="info-banner">
        <ion-icon name="information-circle-outline"></ion-icon>
        <p>Registre ocorrências de forma anônima. O síndico será notificado.</p>
      </div>

      <ion-card class="report-card" (click)="openNewOccurrence()">
        <ion-card-content>
          <div class="report-icon">
            <ion-icon name="warning-outline"></ion-icon>
          </div>
          <div class="report-content">
            <h3>Reportar Ocorrência</h3>
            <p>Registre um incidente ou reclamação</p>
          </div>
          <ion-icon name="chevron-forward-outline" class="chevron"></ion-icon>
        </ion-card-content>
      </ion-card>

      <div *ngIf="isLoading" class="skeleton-list">
        <div *ngFor="let item of [1,2]" class="skeleton-card">
          <ion-skeleton-text animated style="width: 60%; height: 18px;"></ion-skeleton-text>
          <ion-skeleton-text animated style="width: 90%; height: 40px; margin-top: 8px;"></ion-skeleton-text>
          <ion-skeleton-text animated style="width: 40%; height: 14px; margin-top: 8px;"></ion-skeleton-text>
        </div>
      </div>

      <div *ngIf="!isLoading && occurrences.length > 0" class="occurrences-list">
        <h3 class="section-title">Histórico</h3>
        
        <div *ngFor="let occurrence of occurrences" class="occurrence-item">
          <div class="occurrence-icon">
            <ion-icon name="alert-circle-outline"></ion-icon>
          </div>
          <div class="occurrence-content">
            <p class="description">{{ occurrence.description }}</p>
            <p class="date">
              <ion-icon name="time-outline" class="icon-inline"></ion-icon>
              {{ formatDate(occurrence.incidentDate) }}
            </p>
          </div>
        </div>
      </div>

      <div *ngIf="!isLoading && occurrences.length === 0" class="empty-state">
        <ion-icon name="shield-checkmark-outline" class="empty-icon"></ion-icon>
        <p class="empty-title">Tudo Tranquilo</p>
        <p class="empty-message">Nenhuma ocorrência registrada</p>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="openNewOccurrence()">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    .info-banner {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.16);
      border: 1px solid rgba(255, 255, 255, 0.28);
      border-radius: 16px;
      margin-bottom: 20px;
    }
    
    .info-banner ion-icon {
      font-size: 24px;
      color: #fff8f0;
      flex-shrink: 0;
    }
    
    .info-banner p {
      margin: 0;
      font-size: 13px;
      color: #fff8f0;
      line-height: 1.4;
    }
    
    .report-card {
      margin-bottom: 24px;
    }
    
    .report-card ion-card-content {
      display: flex;
      align-items: center;
      padding: 20px;
    }
    
    .report-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: var(--ion-color-danger);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
    }
    
    .report-icon ion-icon {
      font-size: 28px;
      color: white;
    }
    
    .report-content {
      flex: 1;
    }
    
    .report-content h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: #fff8f0;
    }
    
    .report-content p {
      margin: 0;
      font-size: 13px;
      color: rgba(255, 248, 240, 0.82);
    }
    
    .chevron {
      color: rgba(255, 248, 240, 0.82);
      font-size: 20px;
    }
    
    .skeleton-list {
      margin-top: 24px;
    }
    
    .skeleton-card {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 12px;
    }
    
    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: rgba(255, 248, 240, 0.82);
      margin: 0 0 12px 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .occurrences-list {
      margin-top: 24px;
    }
    
    .occurrence-item {
      display: flex;
      align-items: flex-start;
      padding: 16px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 12px;
      margin-bottom: 12px;
      box-shadow: 0 10px 26px rgba(0, 0, 0, 0.26);
    }
    
    .occurrence-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.16);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
    }
    
    .occurrence-icon ion-icon {
      font-size: 20px;
      color: var(--ion-color-danger);
    }
    
    .occurrence-content {
      flex: 1;
    }
    
    .occurrence-content .description {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #fff8f0;
      line-height: 1.4;
    }
    
    .occurrence-content .date {
      margin: 0;
      font-size: 12px;
      color: rgba(255, 248, 240, 0.82);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .icon-inline {
      font-size: 14px;
      color: rgba(255, 248, 240, 0.82);
      flex-shrink: 0;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class OccurrencesTabPage implements OnInit, ViewWillEnter {
  private uiService = inject(UiService);
  private navigation = inject(AppNavigationService);
  private occurrenceService = inject(OccurrenceService);
  private shell = inject(AppShellService);

  occurrences: Occurrence[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadOccurrences();
  }

  ionViewWillEnter(): void {
    this.loadOccurrences();
    this.shell.configure({
      title: 'Ocorrências',
      showBack: false,
      showLogo: true,
      showLogout: true,
      headerState: 'compact',
      progressStep: null,
      progressTotal: null,
    });
    this.shell.setExpandContent(null);
  }

  loadOccurrences(): void {
    this.isLoading = true;
    this.occurrenceService.getAll().pipe(
      catchError(() => of([])),
      finalize(() => this.isLoading = false)
    ).subscribe(list => {
      this.occurrences = list;
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR') + ' às ' + 
           date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  openNewOccurrence(): void {
    void this.navigation.push(APP_ROUTES.occurrencesNew);
  }
}
