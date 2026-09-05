import { Component, computed, inject, signal } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular/standalone';
import { catchError, finalize, of } from 'rxjs';
import { EquipmentReservationService } from '../../services/equipment-reservation.service';
import { UiService } from '../../shared/services/ui.service';
import { CelebrationService } from '../../shared/services/celebration.service';
import { AppShellService } from '../../core/shell/app-shell.service';
import { LayoutService } from '../../core/layout/layout.service';
import { AppNavigationService } from '../../core/navigation/app-navigation.service';
import { APP_ROUTES } from '../../core/navigation/app-routes';
import { LunaTimeSlotSelection } from '../../shared/components/luna-time-slot-picker/luna-time-slot-picker.component';
import { EquipmentReservationCreateDesktopComponent } from './desktop/equipment-reservation-create-desktop.component';
import {
  EquipmentReservationCreateMobileComponent,
  type EquipmentReservationCreateStep,
} from './mobile/equipment-reservation-create-mobile.component';

const TV_EQUIPMENT_ID = 1;

type TvReservationStep = EquipmentReservationCreateStep;

@Component({
  selector: 'app-equipment-reservation-create',
  templateUrl: './equipment-reservation-create.page.html',
  standalone: true,
  imports: [EquipmentReservationCreateDesktopComponent, EquipmentReservationCreateMobileComponent],
})
export class EquipmentReservationCreatePage implements ViewWillEnter {
  private equipmentService = inject(EquipmentReservationService);
  private uiService = inject(UiService);
  private celebration = inject(CelebrationService);
  private shell = inject(AppShellService);
  private navigation = inject(AppNavigationService);
  readonly layout = inject(LayoutService);

  readonly step = signal<TvReservationStep>(1);
  readonly selectedDate = signal('');
  readonly startTime = signal('10:00');
  readonly endTime = signal('12:00');
  readonly durationHours = signal(2);
  readonly isSubmitting = signal(false);

  readonly canProceedStep1 = computed(() => !!this.selectedDate());
  readonly canSubmit = computed(() => {
    return this.canProceedStep1()
      && !!this.startTime()
      && !!this.endTime();
  });

  readonly minPickerDate = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  })();

  readonly pickerDate = computed(() => {
    const iso = this.selectedDate();
    if (!iso) {
      return this.minPickerDate;
    }
    return new Date(`${iso}T00:00:00`);
  });

  ionViewWillEnter(): void {
    this.updateShell();
    this.shell.setExpandContent(null);
  }

  onDateChange(date: Date): void {
    this.selectedDate.set(this.toIsoDate(date));
  }

  onSlotChange(slot: LunaTimeSlotSelection): void {
    this.startTime.set(slot.startTime);
    this.endTime.set(slot.endTime);
    this.durationHours.set(slot.durationHours);
  }

  goToStep(next: TvReservationStep): void {
    if (next === 2 && !this.canProceedStep1()) {
      return;
    }
    this.step.set(next);
    this.updateShell();
  }

  onSubmit(): void {
    if (!this.canSubmit() || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.equipmentService.create({
      equipmentId: TV_EQUIPMENT_ID,
      date: this.selectedDate(),
      startTime: this.startTime(),
      endTime: this.endTime(),
    }).pipe(
      catchError(error => {
        const message = error?.error?.message
          || error?.message
          || 'Não foi possível reservar a TV. Verifique conflito com Salão ou Churrasqueira.';
        void this.uiService.showError(message);
        return of(null);
      }),
      finalize(() => this.isSubmitting.set(false)),
    ).subscribe(async result => {
      if (result) {
        this.celebration.celebrateSuccess();
        await this.navigation.completeFlow(`${APP_ROUTES.reservations}?type=TELEVISAO`);
        await this.uiService.showSuccess('Reserva confirmada! Retire o controle na portaria no horário agendado.');
      }
    });
  }

  private updateShell(): void {
    this.shell.configure({
      title: 'Reservar TV',
      subtitle: this.step() === 1
        ? 'Etapa 1 de 2 — escolha o dia'
        : 'Etapa 2 de 2 — escolha o horário',
      showBack: true,
      showLogo: false,
      showLogout: false,
      headerState: 'compact',
      progressStep: this.step(),
      progressTotal: 2,
    });
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
