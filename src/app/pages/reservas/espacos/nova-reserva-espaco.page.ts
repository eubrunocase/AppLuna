import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservationService } from '../../../services/reservation.service';
import { SpaceService } from '../../../services/space.service';
import { UiService } from '../../../shared/services/ui.service';
import { SpaceType } from '../../../core/models/enums';
import { SPACE_LABELS, SPACE_ICONS, SPACE_COLORS } from '../../../shared/constants/space.constants';
import { formatDate } from '../../../shared/utils/date.utils';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-nova-reserva-espaco',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/reservas/espacos"></ion-back-button>
        </ion-buttons>
        <ion-title>Nova Reserva</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form (ngSubmit)="onSubmit()">
        <div class="form-section">
          <h3>Selecione o Espaço</h3>
          <div class="space-buttons">
            <button *ngFor="let space of spaceOptions"
              type="button"
              class="space-button"
              [class.selected]="selectedSpaceId === space.id"
              (click)="selectSpace(space.id)">
              <div class="space-icon" [style.background]="space.bgColor">
                <ion-icon [name]="space.icon" [style.color]="space.iconColor"></ion-icon>
              </div>
              <span class="space-name">{{ space.name }}</span>
            </button>
          </div>
        </div>

        <div class="form-section">
          <h3>Selecione a Data</h3>
          <button type="button" class="field-button" (click)="showDatePicker = true">
            <ion-icon name="calendar-outline" class="field-icon"></ion-icon>
            <span *ngIf="selectedDate" class="field-label">{{ formatDisplayDate(selectedDate) }}</span>
            <span *ngIf="!selectedDate" class="field-placeholder">Selecione a data</span>
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

        <div class="form-section">
          <h3>Observações (opcional)</h3>
          <ion-textarea [(ngModel)]="notes" name="notes" placeholder="Ex: Aniversário de 30 anos, 50 convidados..." [rows]="3"></ion-textarea>
        </div>

        <div class="form-section">
          <h3>Lista de Convidados (opcional)</h3>
          <div class="guest-input-row">
            <ion-input [(ngModel)]="newGuestName" name="newGuest" placeholder="Nome do convidado"></ion-input>
            <ion-button fill="clear" (click)="addGuest()" [disabled]="!newGuestName.trim()">
              <ion-icon name="add-circle-outline" slot="icon-only"></ion-icon>
            </ion-button>
          </div>
          <div *ngIf="guestNames.length > 0" class="guest-list">
            <div *ngFor="let name of guestNames; let i = index" class="guest-chip">
              <ion-icon name="person-outline"></ion-icon>
              <span>{{ name }}</span>
              <ion-button fill="clear" size="small" (click)="removeGuest(i)">
                <ion-icon name="close-circle" slot="icon-only"></ion-icon>
              </ion-button>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <ion-button expand="block" type="submit" [disabled]="isSubmitting || !selectedSpaceId || !selectedDate || (showAvailabilityResult === false)">
            <ion-spinner *ngIf="isSubmitting" name="crescent"></ion-spinner>
            <span *ngIf="!isSubmitting">Solicitar Reserva</span>
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
    </ion-content>
  `,
  styles: [`
    .form-section { margin-bottom: 24px; }
    .form-section h3 {
      font-size: 14px; font-weight: 600; color: rgba(255, 248, 240, 0.86);
      margin: 0 0 12px 4px; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .space-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .space-button {
      background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.26);
      border-radius: 12px; padding: 16px; display: flex; flex-direction: column;
      align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s ease;
    }
    .space-button.selected { border-color: #ffb067; background: rgba(255, 122, 0, 0.3); box-shadow: 0 6px 18px rgba(255, 122, 0, 0.35); }
    .space-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .space-icon ion-icon { font-size: 24px; }
    .space-name { font-size: 14px; font-weight: 600; color: #fff8f0; text-align: center; }
    .field-button {
      background: rgba(255, 255, 255, 0.14); border: 1px solid rgba(255, 255, 255, 0.28);
      border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px; width: 100%; cursor: pointer;
    }
    .field-icon { color: var(--ion-color-primary); font-size: 22px; }
    .field-label { flex: 1; color: #fffaf5; font-size: 15px; font-weight: 600; text-align: start; }
    .field-placeholder { flex: 1; color: rgba(255, 248, 240, 0.82); font-size: 15px; text-align: start; }
    .chevron-icon { color: rgba(255, 248, 240, 0.86); font-size: 18px; }
    .availability-check {
      display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px;
      color: #fff8f0; background: rgba(255, 255, 255, 0.14); border: 1px dashed rgba(255, 255, 255, 0.42);
      border-radius: 12px; font-size: 14px; margin-bottom: 16px;
    }
    .availability-result {
      display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px;
      border: 1px solid transparent; border-radius: 12px; font-size: 14px; font-weight: 600; margin-bottom: 16px;
    }
    .availability-result.available { background: rgba(45, 211, 111, 0.2); color: #d7ffe8; border-color: rgba(134, 239, 172, 0.8); }
    .availability-result.unavailable { background: rgba(130, 0, 0, 0.26); color: #ffe1e1; border-color: rgba(252, 165, 165, 0.8); }
    .form-actions { margin-top: 32px; }
    .guest-input-row { display: flex; align-items: center; gap: 4px; }
    .guest-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .guest-chip {
      display: flex; align-items: center; gap: 6px; background: rgba(255, 122, 0, 0.2);
      border: 1px solid rgba(255, 122, 0, 0.5); border-radius: 20px; padding: 6px 12px; font-size: 13px; color: #fff8f0;
    }
    .guest-chip ion-icon { font-size: 16px; color: var(--ion-color-primary); }
    .datetime-title { text-align: center; font-weight: 600; color: #fff8f0; }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class NovaReservaEspacoPage implements OnInit {
  private reservationService = inject(ReservationService);
  private spaceService = inject(SpaceService);
  private router = inject(Router);
  private uiService = inject(UiService);

  spaceOptions: { id: number; name: string; icon: string; bgColor: string; iconColor: string }[] = [];
  selectedSpaceId: number | null = null;
  selectedDate = '';
  notes = '';
  guestNames: string[] = [];
  newGuestName = '';
  isSubmitting = false;
  isCheckingAvailability = false;
  showAvailabilityResult: boolean | null = null;
  showDatePicker = false;

  get minDate(): string { return new Date().toISOString().split('T')[0]; }

  ngOnInit(): void {
    this.spaceService.getAll().pipe(catchError(() => of([]))).subscribe(spaces => {
      this.spaceOptions = spaces.map(s => ({
        id: s.id,
        name: SPACE_LABELS[s.type as SpaceType] || String(s.type),
        icon: SPACE_ICONS[s.type as SpaceType] || 'cube-outline',
        bgColor: SPACE_COLORS[s.type as SpaceType]?.background || '#eee',
        iconColor: SPACE_COLORS[s.type as SpaceType]?.iconColor || '#555'
      }));
    });
  }

  selectSpace(id: number): void {
    this.selectedSpaceId = id;
    if (this.selectedDate) this.checkAvailability();
  }

  onDateChange(event: any): void {
    const value = event.detail.value;
    if (value) {
      this.selectedDate = new Date(value).toISOString().split('T')[0];
      this.showDatePicker = false;
      if (this.selectedSpaceId) this.checkAvailability();
    }
  }

  formatDisplayDate(d: string): string { return formatDate(d); }

  checkAvailability(): void {
    if (!this.selectedSpaceId || !this.selectedDate) return;
    this.isCheckingAvailability = true;
    this.showAvailabilityResult = null;
    this.reservationService.checkAvailability(this.selectedDate, this.selectedSpaceId).pipe(
      catchError(() => { this.showAvailabilityResult = null; return of(null); })
    ).subscribe(r => { this.isCheckingAvailability = false; this.showAvailabilityResult = r; });
  }

  addGuest(): void {
    const name = this.newGuestName.trim();
    if (name && !this.guestNames.includes(name)) { this.guestNames.push(name); this.newGuestName = ''; }
  }

  removeGuest(i: number): void { this.guestNames.splice(i, 1); }

  onSubmit(): void {
    if (!this.selectedSpaceId || !this.selectedDate || this.isSubmitting) return;
    this.isSubmitting = true;
    this.reservationService.create({
      space: Number(this.selectedSpaceId),
      date: this.selectedDate,
      notes: this.notes || undefined,
      guestList: this.guestNames.length > 0 ? this.guestNames : undefined
    }).pipe(
      catchError(e => { this.uiService.showError(e.error?.message || 'Erro ao criar reserva'); return of(null); })
    ).subscribe(async r => {
      this.isSubmitting = false;
      if (r) { await this.uiService.showSuccess('Reserva solicitada com sucesso!'); this.router.navigate(['/reservas/espacos']); }
    });
  }
}
