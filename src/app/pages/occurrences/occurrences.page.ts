import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OccurrenceService } from '../../services/occurrence.service';
import { AlertController, ToastController } from '@ionic/angular';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-occurrences',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Registrar Ocorrência</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card class="form-card">
        <ion-card-header>
          <ion-card-title>
            <ion-icon name="alert-circle-outline" class="title-icon"></ion-icon>
            Nova Ocorrência
          </ion-card-title>
          <ion-card-subtitle>
            Registre incidentes ou queixas no condomínio
          </ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <form [formGroup]="occurrenceForm" (ngSubmit)="onSubmit()">
            <ion-list lines="none">
              <ion-item>
                <ion-input 
                  formControlName="description"
                  label="Descrição" 
                  labelPlacement="floating"
                  type="text"
                  placeholder="Descreva o incidente..."
                  [errorText]="getErrorMessage('description')">
                </ion-input>
              </ion-item>

              <ion-item>
                <ion-input 
                  formControlName="incidentDate"
                  label="Data do Incidente" 
                  labelPlacement="floating"
                  type="datetime-local"
                  [errorText]="getErrorMessage('incidentDate')">
                </ion-input>
              </ion-item>

              <ion-note color="warning" class="ion-padding-start">
                <ion-icon name="information-circle-outline"></ion-icon>
                A data do incidente não pode ser no futuro
              </ion-note>
            </ion-list>

            <ion-button 
              expand="block" 
              type="submit" 
              [disabled]="occurrenceForm.invalid || isLoading"
              class="ion-margin-top">
              <ion-spinner *ngIf="isLoading" name="crescent"></ion-spinner>
              <span *ngIf="!isLoading">Registrar Ocorrência</span>
            </ion-button>
          </form>
        </ion-card-content>
      </ion-card>

      <div class="info-section">
        <h3>Como funciona?</h3>
        <ul>
          <li>Registre ocorrências de ruídos, vandalismo, problemas de segurança, etc.</li>
          <li>O síndico receberá uma notificação em tempo real</li>
          <li>Forneça detalhes precisos para facilitar a resolução</li>
        </ul>
      </div>
    </ion-content>
  `,
  styles: [`
    .form-card {
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    
    ion-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
    }
    
    .title-icon {
      color: var(--ion-color-danger);
      font-size: 24px;
    }
    
    ion-item {
      --background: rgba(255, 255, 255, 0.16);
      --border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.24);
      margin-bottom: 12px;
    }
    
    ion-note {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
    }
    
    ion-button {
      --border-radius: 8px;
    }
    
    .info-section {
      margin-top: 24px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 12px;
    }
    
    .info-section h3 {
      font-size: 16px;
      margin-bottom: 12px;
      color: #fff8f0;
    }
    
    .info-section ul {
      padding-left: 20px;
      color: rgba(255, 248, 240, 0.82);
    }
    
    .info-section li {
      margin-bottom: 8px;
    }
  `],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule]
})
export class OccurrencesPage {
  private fb = inject(FormBuilder);
  private occurrenceService = inject(OccurrenceService);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  occurrenceForm: FormGroup = this.fb.group({
    description: ['', [Validators.required, Validators.minLength(10)]],
    incidentDate: ['', [Validators.required]]
  });

  isLoading = false;

  getErrorMessage(field: string): string {
    const control = this.occurrenceForm.get(field);
    if (control?.hasError('required')) return 'Campo obrigatório';
    if (control?.hasError('minlength')) return 'Mínimo 10 caracteres';
    return '';
  }

  onSubmit(): void {
    if (this.occurrenceForm.invalid) return;

    this.isLoading = true;
    const { description, incidentDate } = this.occurrenceForm.value;

    this.occurrenceService.create({
      description,
      incidentDate: new Date(incidentDate).toISOString()
    }).pipe(
      catchError(error => {
        this.showError(error.error?.validationErrors?.incidentDate || 'Erro ao registrar');
        return of(null);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe(response => {
      if (response) {
        this.showSuccess();
        this.occurrenceForm.reset();
      }
    });
  }

  private async showSuccess(): Promise<void> {
    const toast = await this.toastController.create({
      message: 'Ocorrência registrada com sucesso!',
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }

  private async showError(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
}
