import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideArrowRight,
  lucideCalendarCheck,
  lucideKeyRound,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { LunaDatePickerComponent } from '../../../shared/components/luna-date-picker/luna-date-picker.component';
import {
  LunaTimeSlotPickerComponent,
  LunaTimeSlotSelection,
} from '../../../shared/components/luna-time-slot-picker/luna-time-slot-picker.component';

export type EquipmentReservationCreateStep = 1 | 2;

@Component({
  selector: 'app-equipment-reservation-create-mobile',
  templateUrl: './equipment-reservation-create-mobile.component.html',
  styleUrl: './equipment-reservation-create-mobile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      lucideArrowLeft,
      lucideArrowRight,
      lucideCalendarCheck,
      lucideKeyRound,
    }),
  ],
})
export class EquipmentReservationCreateMobileComponent {
  readonly step = input<EquipmentReservationCreateStep>(1);
  readonly startTime = input('10:00');
  readonly durationHours = input(2);
  readonly isSubmitting = input(false);
  readonly canProceedStep1 = input(false);
  readonly canSubmit = input(false);
  readonly minPickerDate = input.required<Date>();
  readonly pickerDate = input.required<Date>();

  readonly dateChange = output<Date>();
  readonly slotChange = output<LunaTimeSlotSelection>();
  readonly goToStep = output<EquipmentReservationCreateStep>();
  readonly submit = output<void>();
}
