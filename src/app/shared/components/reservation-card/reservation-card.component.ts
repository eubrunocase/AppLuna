import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReservationStatusChipComponent } from '../reservation-status-chip/reservation-status-chip.component';
import { getDay, getMonth, formatDate, formatDateTime } from '../../utils/date.utils';
import { getSpaceLabel } from '../../constants/space.constants';
import { ReservationStatus } from '../../../core/models/enums';

export interface CardAction {
  label: string;
  icon: string;
  color: string;
  fill?: string;
  disabled?: boolean;
  visible: boolean;
}

@Component({
  selector: 'app-reservation-card',
  template: `
    <ion-card class="reservation-card" [class.pending-highlight]="pendingHighlight" (click)="cardClick.emit()">
      <ion-card-content>
        <div class="card-row">
          <div class="date-badge" [style.background]="dateBadgeColor">
            <span class="day">{{ day }}</span>
            <span class="month">{{ month }}</span>
          </div>

          <div class="reservation-info">
            <h3 *ngIf="type === 'space'">{{ spaceLabel }}</h3>
            <h3 *ngIf="type === 'equipment'">
              <ion-icon name="tv-outline" class="icon-inline"></ion-icon>
              {{ equipmentName }}
            </h3>
            <p class="resident" *ngIf="showResident">
              <ion-icon name="person-outline" class="icon-inline"></ion-icon>
              {{ residentName }}
            </p>
            <p class="time" *ngIf="type === 'space' && createdAt">
              <ion-icon name="time-outline" class="icon-inline"></ion-icon>
              Solicitado em {{ createdAtFormatted }}
            </p>
            <p class="time" *ngIf="type === 'equipment'">
              <ion-icon name="time-outline" class="icon-inline"></ion-icon>
              {{ startTime }} - {{ endTime }}
            </p>
          </div>

          <app-reservation-status-chip
            [status]="status"
            [type]="type">
          </app-reservation-status-chip>
        </div>

        <div class="equipment-dates" *ngIf="type === 'equipment'">
          <p *ngIf="pickedUpAt" class="date"><strong>Retirado em:</strong> {{ pickedUpAtFormatted }}</p>
          <p *ngIf="returnedAt" class="date"><strong>Devolvido em:</strong> {{ returnedAtFormatted }}</p>
          <p *ngIf="canceledAt" class="date"><strong>Cancelado em:</strong> {{ canceledAtFormatted }}</p>
        </div>

        <div class="card-actions" *ngIf="visibleActions.length > 0">
          <ion-button
            *ngFor="let action of visibleActions"
            expand="block"
            [color]="action.color"
            [fill]="action.fill || 'solid'"
            size="small"
            [disabled]="action.disabled"
            (click)="onAction(action); $event.stopPropagation()">
            <ion-icon slot="start" [name]="action.icon"></ion-icon>
            {{ action.label }}
          </ion-button>
        </div>
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
    .reservation-card {
      margin-bottom: 12px;
      transition: box-shadow 0.2s ease, border-color 0.2s ease;
    }

    .reservation-card.pending-highlight {
      border-left: 4px solid var(--ion-color-warning);
      box-shadow: 0 6px 20px rgba(255, 196, 9, 0.18);
    }

    .reservation-card ion-card-content {
      padding: 16px;
    }

    .card-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .date-badge {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      flex-shrink: 0;
    }

    .date-badge .day {
      font-size: 20px;
      font-weight: 700;
      color: #000;
      line-height: 1;
    }

    .date-badge .month {
      font-size: 11px;
      font-weight: 600;
      color: #000;
      text-transform: uppercase;
    }

    .reservation-info {
      flex: 1;
      min-width: 0;
    }

    .reservation-info h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: #fff8f0;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .reservation-info .time,
    .reservation-info .resident {
      margin: 0;
      font-size: 12px;
      color: rgba(255, 248, 240, 0.82);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .reservation-info .resident {
      margin-bottom: 2px;
    }

    .icon-inline {
      font-size: 14px;
      color: rgba(255, 248, 240, 0.82);
      flex-shrink: 0;
    }

    app-reservation-status-chip {
      flex-shrink: 0;
    }

    .equipment-dates p.date {
      margin: 6px 0 0 0;
      font-size: 12px;
      color: var(--ion-color-medium);
    }

    .card-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.18);
    }

    .card-actions ion-button {
      flex: 1;
      --border-radius: 10px;
      margin: 0;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, ReservationStatusChipComponent]
})
export class ReservationCardComponent {
  @Input() type: 'space' | 'equipment' = 'space';
  @Input() spaceType: string = '';
  @Input() equipmentName: string = '';
  @Input() residentName: string = '';
  @Input() showResident: boolean = false;
  @Input() status: ReservationStatus | any = 'PENDING';
  @Input() date: string = '';
  @Input() createdAt: string = '';
  @Input() startTime: string = '';
  @Input() endTime: string = '';
  @Input() pickedUpAt: string | null = null;
  @Input() returnedAt: string | null = null;
  @Input() canceledAt: string | null = null;
  @Input() dateBadgeColor: string = 'var(--ion-color-tertiary)';
  @Input() pendingHighlight: boolean = false;
  @Input() actions: CardAction[] = [];

  @Output() cardClick = new EventEmitter<void>();
  @Output() actionClick = new EventEmitter<CardAction>();

  get day(): string {
    return getDay(this.date);
  }

  get month(): string {
    return getMonth(this.date);
  }

  get spaceLabel(): string {
    return getSpaceLabel(this.spaceType);
  }

  get createdAtFormatted(): string {
    return formatDate(this.createdAt);
  }

  get pickedUpAtFormatted(): string {
    return formatDateTime(this.pickedUpAt!);
  }

  get returnedAtFormatted(): string {
    return formatDateTime(this.returnedAt!);
  }

  get canceledAtFormatted(): string {
    return formatDateTime(this.canceledAt!);
  }

  get visibleActions(): CardAction[] {
    return this.actions.filter(a => a.visible);
  }

  onAction(action: CardAction): void {
    this.actionClick.emit(action);
  }
}
