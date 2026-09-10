import { Component, inject, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipmentReservationService } from '../../../services/equipment-reservation.service';
import { EquipmentReservationResponseDTO } from '../../../core/models';
import { UiService } from '../../../shared/services/ui.service';
import { formatDate, normalizeTime } from '../../../shared/utils/date.utils';
import { catchError, finalize, of } from 'rxjs';

const TV_EQUIPMENT_ID = 1;

@Component({
  selector: 'app-nova-reserva-equipamento',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/reservas/equipamentos"></ion-back-button>
        </ion-buttons>
        <ion-title>Reservar TV Comunitária</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="tv-card">
        <div class="tv-icon">
          <ion-icon name="tv-outline"></ion-icon>
        </div>
        <div class="tv-info">
          <h2>Televisão Comunitária</h2>
          <p>Uso comunitário gratuito • Retire o controle na portaria</p>
        </div>
      </div>

      <form (ngSubmit)="onSubmit()">
        <div class="form-section">
          <h3>Selecione a Data</h3>
          <button type="button" class="field-button" (click)="showDatePicker = true">
            <ion-icon name="calendar-outline" class="field-icon"></ion-icon>
            <span *ngIf="selectedDate" class="field-label">{{ formatDisplayDate(selectedDate) }}</span>
            <span *ngIf="!selectedDate" class="field-placeholder">Selecione a data</span>
            <ion-icon name="chevron-down" class="chevron-icon"></ion-icon>
          </button>
        </div>

        <div class="form-section">
          <h3>Selecione o Horário</h3>
          <div class="time-row">
            <button type="button" class="field-button time-button" (click)="showStartTimePicker = true">
              <ion-icon name="time-outline" class="field-icon"></ion-icon>
              <div class="time-fields">
                <span class="field-placeholder time-placeholder">Início</span>
                <span class="field-label time-value">{{ startTime || '--:--' }}</span>
              </div>
            </button>
            <button type="button" class="field-button time-button" (click)="showEndTimePicker = true">
              <ion-icon name="time-outline" class="field-icon"></ion-icon>
              <div class="time-fields">
                <span class="field-placeholder time-placeholder">Fim</span>
                <span class="field-label time-value">{{ endTime || '--:--' }}</span>
              </div>
            </button>
          </div>
          <div *ngIf="showTimeError" class="time-error">
            <ion-icon name="alert-circle-outline"></ion-icon>
            <span>O horário de término deve ser após o início.</span>
          </div>
        </div>

        <div class="form-actions">
          <ion-button expand="block" type="submit" [disabled]="isSubmitting || !canSubmit">
            <ion-spinner *ngIf="isSubmitting" name="crescent"></ion-spinner>
            <span *ngIf="!isSubmitting">Confirmar Reserva</span>
          </ion-button>
        </div>
      </form>

      <ion-modal [isOpen]="showDatePicker" (didDismiss)="showDatePicker = false">
        <ng-template>
          <ion-content>
            <ion-datetime presentation="date" [min]="minDate" [value]="selectedDate" (ionChange)="onDateChange($event)">
              <div slot="title" class="datetime-title">Selecione a Data</div>
            </ion-datetime>
          </ion-content>
        </ng-template>
      </ion-modal>
      <ion-modal [isOpen]="showStartTimePicker" (didDismiss)="showStartTimePicker = false">
        <ng-template>
          <ion-content>
            <ion-datetime presentation="time" [value]="startTime" (ionChange)="onStartTimeChange($event)">
              <div slot="title" class="datetime-title">Hora de Início</div>
            </ion-datetime>
          </ion-content>
        </ng-template>
      </ion-modal>
      <ion-modal [isOpen]="showEndTimePicker" (didDismiss)="showEndTimePicker = false">
        <ng-template>
          <ion-content>
            <ion-datetime presentation="time" [value]="endTime" (ionChange)="onEndTimeChange($event)">
              <div slot="title" class="datetime-title">Hora de Término</div>
            </ion-datetime>
          </ion-content>
        </ng-template>
      </ion-modal>
    </ion-content>
  `,
  styles: [`
    .tv-card {
      display: flex; align-items: center; gap: 16px; background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.26); border-radius: 16px; padding: 16px; margin-bottom: 24px;
    }
    .tv-icon {
      width: 56px; height: 56px; border-radius: 14px; background: rgba(255, 122, 0, 0.28);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .tv-icon ion-icon { font-size: 30px; color: var(--ion-color-secondary); }
    .tv-info h2 { margin: 0 0 4px 0; font-size: 17px; font-weight: 700; color: #fff8f0; }
    .tv-info p { margin: 0; font-size: 12px; color: rgba(255, 248, 240, 0.82); line-height: 1.4; }
    .form-section { margin-bottom: 24px; }
    .form-section h3 {
      font-size: 14px; font-weight: 600; color: rgba(255, 248, 240, 0.86);
      margin: 0 0 12px 4px; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .field-button {
      background: rgba(255, 255, 255, 0.14); border: 1px solid rgba(255, 255, 255, 0.28);
      border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px; width: 100%; cursor: pointer;
    }
    .field-icon { color: var(--ion-color-primary); font-size: 22px; }
    .field-label { flex: 1; color: #fffaf5; font-size: 15px; font-weight: 600; text-align: start; }
    .field-placeholder { flex: 1; color: rgba(255, 248, 240, 0.82); font-size: 15px; text-align: start; }
    .chevron-icon { color: rgba(255, 248, 240, 0.86); font-size: 18px; }
    .time-row { display: flex; gap: 12px; }
    .time-button { flex: 1; flex-direction: column; align-items: flex-start; gap: 8px; }
    .time-fields { display: flex; flex-direction: column; width: 100%; }
    .time-placeholder { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8; }
    .time-value { font-size: 20px; font-weight: 700; }
    .time-error {
      display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 12px; border-radius: 10px;
      background: rgba(130, 0, 0, 0.26); color: #ffe1e1; border: 1px solid rgba(252, 165, 165, 0.8); font-size: 13px;
    }
    .datetime-title { text-align: center; font-weight: 600; color: #fff8f0; }
    .form-actions { margin-bottom: 32px; }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class NovaReservaEquipamentoPage implements OnInit {
  private equipmentService = inject(EquipmentReservationService);
  private uiService = inject(UiService);

  selectedDate = '';
  startTime = '';
  endTime = '';
  showDatePicker = false;
  showStartTimePicker = false;
  showEndTimePicker = false;
  isSubmitting = false;

  get minDate(): string { return new Date().toISOString().split('T')[0]; }
  get isTimeValid(): boolean { return !this.startTime || !this.endTime || this.endTime > this.startTime; }
  get showTimeError(): boolean { return !!this.startTime && !!this.endTime && !this.isTimeValid; }
  get canSubmit(): boolean { return !!this.selectedDate && !!this.startTime && !!this.endTime && this.isTimeValid; }

  ngOnInit(): void {}

  formatDisplayDate(d: string): string { return formatDate(d); }

  onDateChange(event: any): void {
    const v = event.detail.value;
    if (v) { this.selectedDate = String(v).split('T')[0]; this.showDatePicker = false; }
  }

  onStartTimeChange(event: any): void {
    const v = event.detail.value;
    if (v) { this.startTime = normalizeTime(v); this.showStartTimePicker = false; }
  }

  onEndTimeChange(event: any): void {
    const v = event.detail.value;
    if (v) { this.endTime = normalizeTime(v); this.showEndTimePicker = false; }
  }

  onSubmit(): void {
    if (!this.canSubmit || this.isSubmitting) return;
    this.isSubmitting = true;
    this.equipmentService.create({ equipmentId: TV_EQUIPMENT_ID, date: this.selectedDate, startTime: this.startTime, endTime: this.endTime }).pipe(
      catchError(e => { this.uiService.showError(e?.error?.message || 'Não foi possível realizar a reserva.'); return of(null); }),
      finalize(() => this.isSubmitting = false)
    ).subscribe(async r => {
      if (r) {
        this.selectedDate = ''; this.startTime = ''; this.endTime = '';
        await this.uiService.showSuccess('Reserva confirmada! Retire o controle na portaria.');
      }
    });
  }
}
