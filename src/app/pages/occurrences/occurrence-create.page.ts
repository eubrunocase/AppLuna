import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OccurrenceService } from '../../services/occurrence.service';
import { UiService } from '../../shared/services/ui.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-occurrence-create',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/occurrences"></ion-back-button>
        </ion-buttons>
        <ion-title>Nova Ocorrência</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="warning-banner">
        <ion-icon name="warning-outline"></ion-icon>
        <div>
          <strong>Esta ação é irreversível</strong>
          <p>A ocorrência será notificada ao síndico imediatamente.</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-section">
          <h3>Quando ocorreu?</h3>

          <button type="button" class="date-button" (click)="openDatePicker()">
            <ion-icon name="calendar-outline" class="calendar-icon"></ion-icon>
            <span *ngIf="selectedIncidentDate" class="date-label">{{ formatDate(selectedIncidentDate) }}</span>
            <span *ngIf="!selectedIncidentDate" class="date-placeholder">Selecione a data</span>
            <ion-icon name="chevron-down" class="chevron-icon"></ion-icon>
          </button>
          <p class="field-hint">Não é permitido registrar ocorrências futuras</p>
        </div>

        <div class="form-section">
          <h3>Descreva o ocorrido</h3>
          
          <ion-textarea 
            formControlName="description"
            placeholder="Descreva detalhadamente o incidente..."
            [rows]="6"
            [counter]="true"
            [maxlength]="500">
          </ion-textarea>
          <p class="field-hint" *ngIf="form.get('description')?.errors?.['minlength']">
            Mínimo de 10 caracteres
          </p>
        </div>

        <div class="form-actions">
          <ion-button 
            expand="block" 
            type="submit" 
            [disabled]="form.invalid || isSubmitting"
            class="submit-button"
            color="danger">
            <ion-icon slot="start" name="alert-circle-outline"></ion-icon>
            <ion-spinner *ngIf="isSubmitting" name="crescent"></ion-spinner>
            <span *ngIf="!isSubmitting">Registrar Ocorrência</span>
          </ion-button>
        </div>
      </form>
    </ion-content>

    <ion-modal [isOpen]="showDatePicker" (didDismiss)="showDatePicker = false">
      <ng-template>
        <ion-content>
          <ion-datetime
            presentation="date"
            [max]="maxDate"
            [value]="selectedIncidentDate"
            (ionChange)="onDateChange($event)">
            <div slot="title" class="datetime-title">Selecione a Data</div>
          </ion-datetime>
        </ion-content>
      </ng-template>
    </ion-modal>
  `,
  styles: [`
    .warning-banner {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: rgba(130, 0, 0, 0.08);
      border-radius: 16px;
      border-left: 4px solid var(--ion-color-danger);
      margin-bottom: 24px;
    }
    
    .warning-banner ion-icon {
      font-size: 28px;
      color: var(--ion-color-danger);
      flex-shrink: 0;
    }
    
    .warning-banner strong {
      display: block;
      font-size: 14px;
      color: var(--ion-color-danger);
      margin-bottom: 4px;
    }
    
    .warning-banner p {
      margin: 0;
      font-size: 12px;
      color: var(--ion-color-medium);
    }
    
    .form-section {
      margin-bottom: 24px;
    }
    
    .form-section h3 {
      font-size: 14px;
      font-weight: 600;
      color: var(--ion-color-medium);
      margin: 0 0 12px 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .date-button {
      background: rgba(255, 255, 255, 0.14);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.28);
      backdrop-filter: blur(10px);
    }

    .calendar-icon {
      color: var(--ion-color-primary);
      font-size: 22px;
    }

    .date-label {
      flex: 1;
      color: #fffaf5;
      font-size: 15px;
      font-weight: 600;
      text-align: start;
    }

    .date-placeholder {
      flex: 1;
      color: rgba(255, 248, 240, 0.82);
      font-size: 15px;
      text-align: start;
    }

    .chevron-icon {
      color: rgba(255, 248, 240, 0.86);
      font-size: 18px;
    }

    .datetime-title {
      text-align: center;
      font-weight: 600;
      color: #fff8f0;
    }
    
    ion-textarea {
      --background: rgba(255, 255, 255, 0.16);
      --color: #fffaf5;
      --placeholder-color: rgba(255, 250, 245, 0.78);
      --border-radius: 12px;
      --padding-start: 16px;
      --padding-end: 16px;
      --padding-top: 16px;
      font-size: 16px;
      border: 1px solid rgba(255, 255, 255, 0.24);
      border-radius: 12px;
    }
    
    .field-hint {
      font-size: 12px;
      color: rgba(255, 248, 240, 0.78);
      margin: 4px 0 0 16px;
    }
    
    .field-hint[color="danger"] {
      color: var(--ion-color-danger);
    }
    
    .form-actions {
      margin-top: 32px;
    }
    
    .submit-button {
      --border-radius: 12px;
      height: 52px;
      font-weight: 600;
      font-size: 16px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class OccurrenceCreatePage {
  private fb = inject(FormBuilder);
  private occurrenceService = inject(OccurrenceService);
  private router = inject(Router);
  private uiService = inject(UiService);

  form: FormGroup = this.fb.group({
    incidentDate: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(10)]]
  });

  isSubmitting = false;
  selectedIncidentDate = '';
  showDatePicker = false;

  get maxDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  openDatePicker(): void {
    this.showDatePicker = true;
  }

  onDateChange(event: any): void {
    const value = event.detail.value;
    if (value) {
      const date = new Date(value);
      this.selectedIncidentDate = date.toISOString().split('T')[0];
      this.form.patchValue({ incidentDate: this.selectedIncidentDate });
      this.form.get('incidentDate')?.markAsTouched();
      this.showDatePicker = false;
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    const { incidentDate, description } = this.form.value;

    this.occurrenceService.create({
      description,
      incidentDate: String(incidentDate)
    }).pipe(
      catchError(error => {
        const message = error.error?.validationErrors?.description || 
                       error.error?.validationErrors?.incidentDate ||
                       error.error?.message ||
                       'Erro ao registrar ocorrência';
        this.uiService.showError(message);
        return of(null);
      })
    ).subscribe(async (result) => {
      this.isSubmitting = false;
      if (result) {
        await this.uiService.showSuccess('Ocorrência registrada com sucesso!');
        this.router.navigate(['/tabs/occurrences']);
      }
    });
  }
}
