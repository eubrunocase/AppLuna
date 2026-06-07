import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { SpaceService } from '../../services/space.service';
import { UiService } from '../../shared/services/ui.service';
import { catchError, of } from 'rxjs';

interface SpaceOption {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  iconColor: string;
}

const SPACE_VISUALS: Record<string, Omit<SpaceOption, 'id'>> = {
  'SALAO_FESTAS': { name: 'Salão de Festas', description: 'Para eventos', icon: 'people-outline', color: '#e3f2fd', iconColor: '#1976d2' },
  'CHURRASQUEIRA': { name: 'Churrasqueira', description: 'Para confraternizações', icon: 'flame-outline', color: '#fff3e0', iconColor: '#f57c00' },
  'ACADEMIA': { name: 'Academia', description: 'Treinos e exercícios', icon: 'barbell-outline', color: '#e8f5e9', iconColor: '#388e3c' },
  'CAMPO_FUTEBOL': { name: 'Campo de Futebol', description: 'Jogos e esportes', icon: 'football-outline', color: '#f3e5f5', iconColor: '#6a1b9a' }
};

@Component({
  selector: 'app-reservation-create',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/reservations"></ion-back-button>
        </ion-buttons>
        <ion-title>Nova Reserva</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form (ngSubmit)="onSubmit()">
        <div class="form-section">
          <h3>Selecione o Espaço</h3>
          
          <div class="space-buttons">
            @for (space of spaces; track space.id) {
              <button 
                type="button"
                class="space-button"
                [class.selected]="selectedSpaceId === space.id"
                (click)="selectSpace(space.id)">
                <div class="space-icon" [style.background]="space.color">
                  <ion-icon [name]="space.icon" [style.color]="space.iconColor"></ion-icon>
                </div>
                <span class="space-name">{{ space.name }}</span>
                <span class="space-description">{{ space.description }}</span>
              </button>
            }
          </div>
        </div>

        <div class="form-section">
          <h3>Selecione a Data</h3>
          
          <button type="button" class="date-button" (click)="openDatePicker()">
            <ion-icon name="calendar-outline" class="calendar-icon"></ion-icon>
            <span *ngIf="selectedDate" class="date-label">{{ formatDate(selectedDate) }}</span>
            <span *ngIf="!selectedDate" class="date-placeholder">Selecione a data</span>
            <ion-icon name="chevron-down" class="chevron-icon"></ion-icon>
          </button>
        </div>

        <div *ngIf="isCheckingAvailability" class="availability-check">
          <ion-spinner name="dots"></ion-spinner>
          <span>Verificando disponibilidade...</span>
        </div>

        <div *ngIf="showAvailabilityResult !== null" class="availability-result" [class.available]="showAvailabilityResult" [class.unavailable]="!showAvailabilityResult">
          <ion-icon [name]="showAvailabilityResult ? 'checkmark-circle' : 'close-circle'"></ion-icon>
          <span>{{ showAvailabilityResult ? 'Data disponível!' : 'Data já reservada' }}</span>
        </div>

        <div class="form-actions">
          <ion-button 
            expand="block" 
            type="submit" 
            [disabled]="isSubmitting || !selectedSpaceId || !selectedDate || (showAvailabilityResult === false)"
            class="submit-button">
            <ion-spinner *ngIf="isSubmitting" name="crescent"></ion-spinner>
            <span *ngIf="!isSubmitting">Solicitar Reserva</span>
          </ion-button>
        </div>
      </form>
    </ion-content>

    <ion-modal [isOpen]="showDatePicker" (didDismiss)="showDatePicker = false">
      <ng-template>
        <ion-content>
          <ion-datetime
            presentation="date"
            [min]="minDate"
            [value]="selectedDate"
            (ionChange)="onDateChange($event)">
            <div slot="title" class="datetime-title">Selecione a Data</div>
          </ion-datetime>
        </ion-content>
      </ng-template>
    </ion-modal>
  `,
  styles: [`
    .form-section {
      margin-bottom: 24px;
    }
    
    .form-section h3 {
      font-size: 14px;
      font-weight: 600;
      color: rgba(255, 248, 240, 0.86);
      margin: 0 0 12px 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .space-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    
    .space-button {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.26);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .space-button:hover {
      border-color: rgba(255, 255, 255, 0.4);
      background: rgba(255, 255, 255, 0.16);
    }
    
    .space-button.selected {
      border-color: #ffb067;
      background: rgba(255, 122, 0, 0.3);
      box-shadow: 0 6px 18px rgba(255, 122, 0, 0.35);
    }
    
    .space-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .space-icon ion-icon {
      font-size: 24px;
    }
    
    .space-name {
      font-size: 14px;
      font-weight: 600;
      color: #fff8f0;
      text-align: center;
    }
    
    .space-description {
      font-size: 12px;
      color: rgba(255, 248, 240, 0.84);
      font-weight: 500;
      line-height: 1.35;
      text-align: center;
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
    
    .availability-check {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      color: #fff8f0;
      background: rgba(255, 255, 255, 0.14);
      border: 1px dashed rgba(255, 255, 255, 0.42);
      border-radius: 12px;
      font-size: 14px;
      margin-bottom: 16px;
    }
    
    .availability-result {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      border: 1px solid transparent;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    
    .availability-result.available {
      background: rgba(45, 211, 111, 0.2);
      color: #d7ffe8;
      border-color: rgba(134, 239, 172, 0.8);
    }
    
    .availability-result.unavailable {
      background: rgba(130, 0, 0, 0.26);
      color: #ffe1e1;
      border-color: rgba(252, 165, 165, 0.8);
    }
    
    .availability-result ion-icon {
      font-size: 20px;
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
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ReservationCreatePage implements OnInit {
  private reservationService = inject(ReservationService);
  private spaceService = inject(SpaceService);
  private router = inject(Router);
  private uiService = inject(UiService);

  spaces: SpaceOption[] = [];

  selectedSpaceId: number | null = null;
  selectedDate: string = '';
  isSubmitting = false;
  isCheckingAvailability = false;
  showAvailabilityResult: boolean | null = null;
  showDatePicker = false;

  ngOnInit(): void {
    this.loadSpaces();
  }

  private loadSpaces(): void {
    this.spaceService.getAll().pipe(
      catchError(() => of([]))
    ).subscribe(spaces => {
      this.spaces = spaces.map(s => {
        const visuals = SPACE_VISUALS[String(s.type)] ?? {
          name: String(s.type),
          description: '',
          icon: 'cube-outline',
          color: '#eeeeee',
          iconColor: '#555555'
        };
        return { id: s.id, ...visuals };
      });
    });
  }

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  selectSpace(id: number): void {
    this.selectedSpaceId = id;
    if (this.selectedDate) {
      this.checkAvailability();
    }
  }

  openDatePicker(): void {
    this.showDatePicker = true;
  }

  onDateChange(event: any): void {
    const value = event.detail.value;
    if (value) {
      const date = new Date(value);
      this.selectedDate = date.toISOString().split('T')[0];
      this.showDatePicker = false;
      if (this.selectedSpaceId) {
        this.checkAvailability();
      }
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  }

  checkAvailability(): void {
    if (!this.selectedSpaceId || !this.selectedDate) return;

    this.isCheckingAvailability = true;
    this.showAvailabilityResult = null;

    this.reservationService.checkAvailability(this.selectedDate, this.selectedSpaceId).pipe(
      catchError(() => {
        this.showAvailabilityResult = null;
        return of(null);
      })
    ).subscribe((isAvailable) => {
      this.isCheckingAvailability = false;
      this.showAvailabilityResult = isAvailable;
    });
  }

  onSubmit(): void {
    if (!this.selectedSpaceId || !this.selectedDate) return;

    this.isSubmitting = true;

    const space = Number(this.selectedSpaceId);

    this.reservationService.create({
      space,
      date: this.selectedDate
    }).pipe(
      catchError(error => {
        this.uiService.showError(error.error?.message || 'Erro ao criar reserva');
        return of(null);
      })
    ).subscribe(async (result) => {
      this.isSubmitting = false;
      if (result) {
        await this.uiService.showSuccess('Reserva solicitada com sucesso!');
        this.router.navigate(['/tabs/reservations']);
      }
    });
  }
}