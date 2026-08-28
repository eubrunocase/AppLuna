import { Component, inject, OnInit } from '@angular/core';
import { IonicModule, AlertController, ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipmentReservationService } from '../../services/equipment-reservation.service';
import { EquipmentReservationResponseDTO, EquipmentReservationStatus } from '../../core/models';
import { UiService } from '../../shared/services/ui.service';
import { AppShellService } from '../../core/shell/app-shell.service';
import { catchError, finalize, of } from 'rxjs';

const TV_EQUIPMENT_ID = 1;
const TV_NAME = 'Televisão Comunitária';

@Component({
  selector: 'app-equipment-reservation-create',
  template: `
    <ion-content class="shell-page-content ion-padding">
      <div class="tv-card">
        <div class="tv-icon">
          <ion-icon name="tv-outline"></ion-icon>
        </div>
        <div class="tv-info">
          <h2>{{ tvName }}</h2>
          <p>Uso comunitário gratuito • Retire o controle na portaria</p>
        </div>
      </div>

      <form (ngSubmit)="onSubmit()">
        <div class="form-section">
          <h3>Selecione a Data</h3>

          <button type="button" class="field-button" (click)="openDatePicker()">
            <ion-icon name="calendar-outline" class="field-icon"></ion-icon>
            <span *ngIf="selectedDate" class="field-label">{{ formatDate(selectedDate) }}</span>
            <span *ngIf="!selectedDate" class="field-placeholder">Selecione a data</span>
            <ion-icon name="chevron-down" class="chevron-icon"></ion-icon>
          </button>
        </div>

        <div class="form-section">
          <h3>Selecione o Horário</h3>

          <div class="time-row">
            <button type="button" class="field-button time-button" (click)="openStartTimePicker()">
              <ion-icon name="time-outline" class="field-icon"></ion-icon>
              <div class="time-fields">
                <span class="field-placeholder time-placeholder">Início</span>
                <span class="field-label time-value">{{ startTime || '--:--' }}</span>
              </div>
              <ion-icon name="chevron-down" class="chevron-icon"></ion-icon>
            </button>

            <button type="button" class="field-button time-button" (click)="openEndTimePicker()">
              <ion-icon name="time-outline" class="field-icon"></ion-icon>
              <div class="time-fields">
                <span class="field-placeholder time-placeholder">Fim</span>
                <span class="field-label time-value">{{ endTime || '--:--' }}</span>
              </div>
              <ion-icon name="chevron-down" class="chevron-icon"></ion-icon>
            </button>
          </div>

          <div *ngIf="showTimeError" class="time-error">
            <ion-icon name="alert-circle-outline"></ion-icon>
            <span>O horário de término deve ser após o início.</span>
          </div>
        </div>

        <div class="form-actions">
          <ion-button
            expand="block"
            type="submit"
            [disabled]="isSubmitting || !canSubmit"
            class="submit-button">
            <ion-spinner *ngIf="isSubmitting" name="crescent"></ion-spinner>
            <span *ngIf="!isSubmitting">Confirmar Reserva</span>
          </ion-button>
        </div>
      </form>

      <div class="my-reservations">
        <h3 class="section-title">Minhas Reservas</h3>

        <div *ngIf="isLoadingMine" class="skeleton-list">
          <div *ngFor="let item of [1,2]" class="skeleton-card">
            <ion-skeleton-text animated style="width: 40%; height: 16px;"></ion-skeleton-text>
            <ion-skeleton-text animated style="width: 60%; height: 14px; margin-top: 8px;"></ion-skeleton-text>
          </div>
        </div>

        <ion-card *ngFor="let reservation of myReservations" class="reservation-card">
          <ion-card-content>
            <div class="reservation-row">
              <div class="reservation-info">
                <span class="reservation-date">{{ formatDate(reservation.date) }}</span>
                <span class="reservation-time">{{ reservation.startTime }} - {{ reservation.endTime }}</span>
              </div>
              <ion-chip [color]="getStatusColor(reservation.status)">
                {{ getStatusLabel(reservation.status) }}
              </ion-chip>
            </div>
            <p *ngIf="reservation.pickedUpAt" class="date"><strong>Retirado:</strong> {{ formatDateTime(reservation.pickedUpAt) }}</p>
            <p *ngIf="reservation.returnedAt" class="date"><strong>Devolvido:</strong> {{ formatDateTime(reservation.returnedAt) }}</p>
            <p *ngIf="reservation.canceledAt" class="date"><strong>Cancelado:</strong> {{ formatDateTime(reservation.canceledAt) }}</p>
            <div *ngIf="reservation.status === 'CONFIRMED'" class="cancel-actions">
              <ion-button expand="block" color="danger" fill="outline" size="small"
                          [disabled]="cancelingId === reservation.id"
                          (click)="cancelReservation(reservation)">
                <ion-spinner *ngIf="cancelingId === reservation.id" name="dots"></ion-spinner>
                <ng-container *ngIf="cancelingId !== reservation.id">
                  <ion-icon slot="start" name="ban-outline"></ion-icon>
                  Cancelar Reserva
                </ng-container>
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>

        <div *ngIf="!isLoadingMine && myReservations.length === 0" class="empty-state">
          <ion-icon name="tv-outline" class="empty-icon"></ion-icon>
          <p>Você ainda não possui reservas da TV</p>
        </div>
      </div>
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

    <ion-modal [isOpen]="showStartTimePicker" (didDismiss)="showStartTimePicker = false">
      <ng-template>
        <ion-content>
          <ion-datetime
            presentation="time"
            [value]="startTime"
            (ionChange)="onStartTimeChange($event)">
            <div slot="title" class="datetime-title">Hora de Início</div>
          </ion-datetime>
        </ion-content>
      </ng-template>
    </ion-modal>

    <ion-modal [isOpen]="showEndTimePicker" (didDismiss)="showEndTimePicker = false">
      <ng-template>
        <ion-content>
          <ion-datetime
            presentation="time"
            [value]="endTime"
            (ionChange)="onEndTimeChange($event)">
            <div slot="title" class="datetime-title">Hora de Término</div>
          </ion-datetime>
        </ion-content>
      </ng-template>
    </ion-modal>
  `,
  styles: [`
    .tv-card {
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.26);
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .tv-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      background: rgba(255, 122, 0, 0.28);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .tv-icon ion-icon {
      font-size: 30px;
      color: var(--ion-color-secondary);
    }

    .tv-info h2 {
      margin: 0 0 4px 0;
      font-size: 17px;
      font-weight: 700;
      color: #fff8f0;
    }

    .tv-info p {
      margin: 0;
      font-size: 12px;
      color: rgba(255, 248, 240, 0.82);
      line-height: 1.4;
    }

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

    .field-button {
      background: rgba(255, 255, 255, 0.14);
      border: 1px solid rgba(255, 255, 255, 0.28);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      cursor: pointer;
    }

    .field-icon {
      color: var(--ion-color-primary);
      font-size: 22px;
    }

    .field-label {
      flex: 1;
      color: #fffaf5;
      font-size: 15px;
      font-weight: 600;
      text-align: start;
    }

    .field-placeholder {
      flex: 1;
      color: rgba(255, 248, 240, 0.82);
      font-size: 15px;
      text-align: start;
    }

    .chevron-icon {
      color: rgba(255, 248, 240, 0.86);
      font-size: 18px;
    }

    .time-row {
      display: flex;
      gap: 12px;
    }

    .time-button {
      flex: 1;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .time-fields {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .time-placeholder {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.8;
    }

    .time-value {
      font-size: 20px;
      font-weight: 700;
    }

    .time-error {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 12px;
      border-radius: 10px;
      background: rgba(130, 0, 0, 0.26);
      color: #ffe1e1;
      border: 1px solid rgba(252, 165, 165, 0.8);
      font-size: 13px;
    }

    .datetime-title {
      text-align: center;
      font-weight: 600;
      color: #fff8f0;
    }

    .form-actions {
      margin-bottom: 32px;
    }

    .submit-button {
      --border-radius: 12px;
      height: 52px;
      font-weight: 600;
      font-size: 16px;
    }

    .my-reservations {
      margin-top: 8px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: rgba(255, 248, 240, 0.86);
      margin: 0 0 12px 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .skeleton-list {
      padding: 0;
    }

    .skeleton-card {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 12px;
    }

    .reservation-card {
      margin-bottom: 12px;
      border-radius: 12px;
    }

    .reservation-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .reservation-info {
      display: flex;
      flex-direction: column;
    }

    .reservation-date {
      font-size: 15px;
      font-weight: 600;
      color: var(--ion-color-dark);
    }

    .reservation-time {
      font-size: 13px;
      color: var(--ion-color-medium);
    }

    .reservation-card p.date {
      margin: 8px 0 0 0;
      font-size: 12px;
      color: var(--ion-color-medium);
    }

    .cancel-actions {
      margin-top: 10px;
    }

    .cancel-actions ion-button {
      --border-radius: 10px;
      margin: 0;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      color: var(--ion-color-medium);
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EquipmentReservationCreatePage implements OnInit, ViewWillEnter {
  private equipmentService = inject(EquipmentReservationService);
  private uiService = inject(UiService);
  private shell = inject(AppShellService);
  private alertController = inject(AlertController);

  tvName = TV_NAME;

  selectedDate: string = '';
  startTime: string = '';
  endTime: string = '';

  showDatePicker = false;
  showStartTimePicker = false;
  showEndTimePicker = false;

  isSubmitting = false;
  isLoadingMine = false;
  cancelingId: string | null = null;
  myReservations: EquipmentReservationResponseDTO[] = [];

  ngOnInit(): void {
    this.loadMyReservations();
  }

  ionViewWillEnter(): void {
    this.shell.configure({
      title: 'Reservar TV Comunitária',
      showBack: true,
      showLogo: false,
      showLogout: false,
      headerState: 'compact',
    });
    this.shell.setExpandContent(null);
  }

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  get isTimeValid(): boolean {
    if (!this.startTime || !this.endTime) return true;
    return this.endTime > this.startTime;
  }

  get showTimeError(): boolean {
    return !!this.startTime && !!this.endTime && !this.isTimeValid;
  }

  get canSubmit(): boolean {
    return !!this.selectedDate && !!this.startTime && !!this.endTime && this.isTimeValid;
  }

  openDatePicker(): void {
    this.showDatePicker = true;
  }

  openStartTimePicker(): void {
    this.showStartTimePicker = true;
  }

  openEndTimePicker(): void {
    this.showEndTimePicker = true;
  }

  onDateChange(event: any): void {
    const value = event.detail.value;
    if (value) {
      this.selectedDate = String(value).split('T')[0];
      this.showDatePicker = false;
    }
  }

  onStartTimeChange(event: any): void {
    const value = event.detail.value;
    if (value) {
      this.startTime = this.normalizeTime(value);
      this.showStartTimePicker = false;
    }
  }

  onEndTimeChange(event: any): void {
    const value = event.detail.value;
    if (value) {
      this.endTime = this.normalizeTime(value);
      this.showEndTimePicker = false;
    }
  }

  private normalizeTime(value: any): string {
    const time = String(value).split('T')[1] ?? String(value);
    return time.slice(0, 5);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR');
  }

  getStatusColor(status: EquipmentReservationStatus): string {
    const colors: Record<EquipmentReservationStatus, string> = {
      [EquipmentReservationStatus.CONFIRMED]: 'primary',
      [EquipmentReservationStatus.IN_USE]: 'warning',
      [EquipmentReservationStatus.RETURNED]: 'success',
      [EquipmentReservationStatus.CANCELED]: 'medium'
    };
    return colors[status] || 'medium';
  }

  getStatusLabel(status: EquipmentReservationStatus): string {
    const labels: Record<EquipmentReservationStatus, string> = {
      [EquipmentReservationStatus.CONFIRMED]: 'Confirmado',
      [EquipmentReservationStatus.IN_USE]: 'Em Uso',
      [EquipmentReservationStatus.RETURNED]: 'Devolvido',
      [EquipmentReservationStatus.CANCELED]: 'Cancelado'
    };
    return labels[status] || status;
  }

  loadMyReservations(): void {
    this.isLoadingMine = true;
    this.equipmentService.listMine().pipe(
      catchError(() => of([])),
      finalize(() => this.isLoadingMine = false)
    ).subscribe(reservations => {
      this.myReservations = reservations;
    });
  }

  async cancelReservation(reservation: EquipmentReservationResponseDTO): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Cancelar reserva',
      message: `Deseja realmente cancelar a reserva da TV para ${this.formatDate(reservation.date)} (${reservation.startTime} - ${reservation.endTime})?`,
      buttons: [
        { text: 'Voltar', role: 'cancel' },
        {
          text: 'Cancelar reserva',
          role: 'destructive',
          handler: () => this.doCancel(reservation)
        }
      ]
    });
    await alert.present();
  }

  private doCancel(reservation: EquipmentReservationResponseDTO): void {
    if (this.cancelingId) return;
    this.cancelingId = reservation.id;
    this.equipmentService.cancel(reservation.id).pipe(
      catchError(error => {
        const message = error?.error?.message
          || error?.message
          || 'Não foi possível cancelar a reserva. Tente novamente.';
        this.uiService.showError(message);
        return of(null);
      }),
      finalize(() => this.cancelingId = null)
    ).subscribe(async (result) => {
      if (result) {
        await this.uiService.showSuccess('Reserva cancelada com sucesso.');
        this.loadMyReservations();
      }
    });
  }

  onSubmit(): void {
    if (!this.canSubmit || this.isSubmitting) return;

    this.isSubmitting = true;
    this.equipmentService.create({
      equipmentId: TV_EQUIPMENT_ID,
      date: this.selectedDate,
      startTime: this.startTime,
      endTime: this.endTime
    }).pipe(
      catchError(error => {
        const message = error?.error?.message
          || error?.message
          || 'Não foi possível realizar a reserva. Tente novamente.';
        this.uiService.showError(message);
        return of(null);
      }),
      finalize(() => this.isSubmitting = false)
    ).subscribe(async (result) => {
      if (result) {
        this.selectedDate = '';
        this.startTime = '';
        this.endTime = '';
        await this.uiService.showSuccess('Reserva confirmada! Retire o controle na portaria no horário agendado.');
        this.loadMyReservations();
      }
    });
  }
}
