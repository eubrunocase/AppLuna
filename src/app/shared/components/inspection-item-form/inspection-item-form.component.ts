import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inspection-item-form',
  template: `
    <div class="equipment-card">
      <div class="equipment-header">
        <span class="equipment-name">{{ equipmentName }}</span>
        <ion-checkbox
          [(ngModel)]="internalChecked"
          (ionChange)="checkedChange.emit(internalChecked)"
          class="status-checkbox">
        </ion-checkbox>
      </div>
      <div class="equipment-photo">
        <ion-input
          [(ngModel)]="internalPhotoUrl"
          (ionChange)="photoUrlChange.emit(internalPhotoUrl)"
          placeholder="URL da foto (ex: https://...)"
          class="photo-input">
        </ion-input>
      </div>
    </div>
  `,
  styles: [`
    .equipment-card {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.26);
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 10px;
    }

    .equipment-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .equipment-name {
      font-size: 15px;
      font-weight: 600;
      color: #fff8f0;
    }

    .status-checkbox {
      --background: rgba(255, 255, 255, 0.26);
      --checkmark-color: #fff;
    }

    .equipment-photo {
      margin-top: 10px;
    }

    .photo-input {
      --background: rgba(255, 255, 255, 0.1);
      --color: #fff8f0;
      --placeholder-color: rgba(255, 248, 240, 0.4);
      --border: 1px solid rgba(255, 255, 255, 0.2);
      --border-radius: 10px;
      --padding-start: 12px;
      --padding-end: 12px;
      font-size: 13px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class InspectionItemFormComponent {
  @Input() equipmentName: string = '';
  @Input() photoUrl: string = '';
  @Input() checked: boolean = true;

  @Output() photoUrlChange = new EventEmitter<string>();
  @Output() checkedChange = new EventEmitter<boolean>();

  internalPhotoUrl: string = '';
  internalChecked: boolean = true;

  ngOnChanges(): void {
    this.internalPhotoUrl = this.photoUrl;
    this.internalChecked = this.checked;
  }
}
