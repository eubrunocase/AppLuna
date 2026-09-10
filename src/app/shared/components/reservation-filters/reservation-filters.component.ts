import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpaceType } from '../../../core/models/enums';
import { SPACE_LABELS } from '../../constants/space.constants';

export interface FilterState {
  dateFrom: string;
  dateTo: string;
  spaceType: SpaceType | 'ALL';
}

@Component({
  selector: 'app-reservation-filters',
  template: `
    <div class="filters-container">
      <div class="filter-row" *ngIf="showDateFilter">
        <div class="date-filter">
          <button type="button" class="filter-button" (click)="openDateFromPicker()">
            <ion-icon name="calendar-outline" class="filter-icon"></ion-icon>
            <span *ngIf="filters.dateFrom" class="filter-value">{{ filters.dateFrom }}</span>
            <span *ngIf="!filters.dateFrom" class="filter-placeholder">De</span>
          </button>
          <button type="button" class="filter-button" (click)="openDateToPicker()">
            <ion-icon name="calendar-outline" class="filter-icon"></ion-icon>
            <span *ngIf="filters.dateTo" class="filter-value">{{ filters.dateTo }}</span>
            <span *ngIf="!filters.dateTo" class="filter-placeholder">Até</span>
          </button>
        </div>
      </div>

      <div class="filter-row" *ngIf="showSpaceFilter">
        <ion-segment [(ngModel)]="filters.spaceType" (ionChange)="onFilterChange()">
          <ion-segment-button value="ALL">
            <ion-label>Todas</ion-label>
          </ion-segment-button>
          <ion-segment-button *ngFor="let space of spaceOptions" [value]="space">
            <ion-label>{{ getLabel(space) }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>
    </div>
  `,
  styles: [`
    .filters-container {
      padding: 0;
    }

    .filter-row {
      margin-bottom: 8px;
    }

    .date-filter {
      display: flex;
      gap: 8px;
    }

    .filter-button {
      flex: 1;
      background: rgba(255, 255, 255, 0.14);
      border: 1px solid rgba(255, 255, 255, 0.28);
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .filter-icon {
      color: var(--ion-color-primary);
      font-size: 18px;
    }

    .filter-value {
      flex: 1;
      color: #fffaf5;
      font-size: 13px;
      font-weight: 600;
      text-align: start;
    }

    .filter-placeholder {
      flex: 1;
      color: rgba(255, 248, 240, 0.6);
      font-size: 13px;
      text-align: start;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ReservationFiltersComponent {
  @Input() showSpaceFilter: boolean = true;
  @Input() showDateFilter: boolean = true;
  @Input() spaceOptions: SpaceType[] = [
    SpaceType.SALAO_FESTAS,
    SpaceType.CHURRASQUEIRA,
    SpaceType.CAMPO_FUTEBOL
  ];

  @Output() filtersChange = new EventEmitter<FilterState>();

  filters: FilterState = {
    dateFrom: '',
    dateTo: '',
    spaceType: 'ALL'
  };

  showDateFromPicker = false;
  showDateToPicker = false;

  getLabel(type: string): string {
    return SPACE_LABELS[type as SpaceType] || type;
  }

  openDateFromPicker(): void {
    this.showDateFromPicker = true;
  }

  openDateToPicker(): void {
    this.showDateToPicker = true;
  }

  onDateFromChange(event: any): void {
    const value = event.detail.value;
    if (value) {
      this.filters.dateFrom = String(value).split('T')[0];
      this.showDateFromPicker = false;
      this.onFilterChange();
    }
  }

  onDateToChange(event: any): void {
    const value = event.detail.value;
    if (value) {
      this.filters.dateTo = String(value).split('T')[0];
      this.showDateToPicker = false;
      this.onFilterChange();
    }
  }

  onFilterChange(): void {
    this.filtersChange.emit({ ...this.filters });
  }
}
