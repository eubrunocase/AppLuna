import { Component, computed, inject, signal } from '@angular/core';
import { IonContent, ViewWillEnter } from '@ionic/angular/standalone';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendarCheck } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { catchError, finalize, of } from 'rxjs';
import { EquipmentReservationService } from '../../services/equipment-reservation.service';
import { UiService } from '../../shared/services/ui.service';
import { AppShellService } from '../../core/shell/app-shell.service';
import { AppNavigationService } from '../../core/navigation/app-navigation.service';
import { APP_ROUTES } from '../../core/navigation/app-routes';
import { LunaDatePickerComponent } from '../../shared/components/luna-date-picker/luna-date-picker.component';
import { LunaTimeSlotPickerComponent, LunaTimeSlotSelection } from '../../shared/components/luna-time-slot-picker/luna-time-slot-picker.component';

const TV_EQUIPMENT_ID = 1;

@Component({
  selector: 'app-equipment-reservation-create',
  templateUrl: './equipment-reservation-create.page.html',
  styleUrl: './equipment-reservation-create.page.scss',
  standalone: true,
  imports: [
    IonContent,
    NgIcon,
    HlmButtonImports,
    HlmSpinnerImports,
    LunaDatePickerComponent,
    LunaTimeSlotPickerComponent,
  ],
  providers: [
    provideIcons({
      lucideCalendarCheck,
    }),
  ],
})
export class EquipmentReservationCreatePage implements ViewWillEnter {
  private equipmentService = inject(EquipmentReservationService);
  private uiService = inject(UiService);
  private shell = inject(AppShellService);
  private navigation = inject(AppNavigationService);

  readonly selectedDate = signal('');
  readonly startTime = signal('10:00');
  readonly endTime = signal('12:00');
  readonly durationHours = signal(2);
  readonly isSubmitting = signal(false);

  readonly canSubmit = computed(() => {
    return !!this.selectedDate()
      && !!this.startTime()
      && !!this.endTime();
  });

  readonly minPickerDate = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  })();

  ionViewWillEnter(): void {
    this.shell.configure({
      title: 'Reservar TV Comunitária',
      subtitle: 'Escolha data e horário de uso',
      showBack: true,
      showLogo: false,
      showLogout: false,
      headerState: 'compact',
    });
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
        const message = error?.message
          || error?.error?.message
          || 'Não foi possível realizar a reserva. Tente novamente.';
        void this.uiService.showError(message);
        return of(null);
      }),
      finalize(() => this.isSubmitting.set(false)),
    ).subscribe(async result => {
      if (result) {
        await this.navigation.completeFlow(`${APP_ROUTES.reservations}?type=TELEVISAO`);
        await this.uiService.showSuccess('Reserva confirmada! Retire o controle na portaria no horário agendado.');
      }
    });
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
