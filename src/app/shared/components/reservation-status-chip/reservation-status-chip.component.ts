import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReservationStatus, EquipmentReservationStatus } from '../../../core/models/enums';
import {
  RESERVATION_STATUS_LABELS,
  EQUIPMENT_STATUS_LABELS
} from '../../constants/status.constants';

@Component({
  selector: 'app-reservation-status-chip',
  template: `
    <ion-chip [class]="chipClass">
      {{ chipLabel }}
    </ion-chip>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ReservationStatusChipComponent {
  @Input() status: ReservationStatus | EquipmentReservationStatus = ReservationStatus.PENDING;
  @Input() type: 'space' | 'equipment' = 'space';

  get chipLabel(): string {
    if (this.type === 'equipment') {
      return EQUIPMENT_STATUS_LABELS[this.status as EquipmentReservationStatus] || String(this.status);
    }
    return RESERVATION_STATUS_LABELS[this.status as ReservationStatus] || String(this.status);
  }

  get chipClass(): string {
    return 'chip-' + String(this.status);
  }
}
