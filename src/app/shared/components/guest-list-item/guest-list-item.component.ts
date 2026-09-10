import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { GuestResponseDTO } from '../../../core/models/reservation.model';
import { formatDateTime } from '../../utils/date.utils';

@Component({
  selector: 'app-guest-list-item',
  template: `
    <ion-item class="guest-item" [class.checked-in]="guest.checkedIn">
      <ion-icon [name]="guest.checkedIn ? 'checkmark-circle' : 'person-outline'"
                slot="start"
                [class]="guest.checkedIn ? 'checked-icon' : ''">
      </ion-icon>
      <ion-label>
        <h2 [class]="guest.checkedIn ? 'guest-name-checked' : ''">{{ guest.name }}</h2>
        <p *ngIf="guest.checkedIn && guest.checkedInAt" class="checkin-time">
          Check-in: {{ checkedInAtFormatted }}
        </p>
      </ion-label>
      <ion-button
        *ngIf="isEventDay && canCheckIn && !guest.checkedIn"
        slot="end"
        color="success"
        fill="outline"
        size="small"
        (click)="checkInClick.emit(guest)">
        Check-in
      </ion-button>
      <ion-chip *ngIf="guest.checkedIn" slot="end" class="chip-checked">
        Presente
      </ion-chip>
    </ion-item>
  `,
  styles: [`
    .guest-item {
      --background: rgba(255, 255, 255, 0.08);
      --border-radius: 12px;
      margin-bottom: 8px;
      --padding-start: 16px;
      --padding-end: 16px;
      --min-height: 64px;
    }

    .guest-item.checked-in {
      --background: rgba(255, 255, 255, 0.04);
      opacity: 0.7;
    }

    .guest-item h2 {
      font-weight: 600;
      color: #fff8f0;
    }

    .guest-name-checked {
      text-decoration: line-through;
      color: rgba(255, 248, 240, 0.5) !important;
    }

    .checked-icon {
      color: var(--ion-color-success);
    }

    .checkin-time {
      font-size: 12px;
      color: rgba(255, 248, 240, 0.6);
      margin: 4px 0 0 0;
    }

    .chip-checked {
      --background: var(--ion-color-success);
      --color: #fff;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class GuestListItemComponent {
  @Input() guest: GuestResponseDTO = { id: '', name: '', checkedIn: false };
  @Input() isEventDay: boolean = false;
  @Input() canCheckIn: boolean = true;

  @Output() checkInClick = new EventEmitter<GuestResponseDTO>();

  get checkedInAtFormatted(): string {
    return this.guest.checkedInAt ? formatDateTime(this.guest.checkedInAt) : '';
  }
}
