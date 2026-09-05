import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideCalendarCheck,
  lucideCircleCheck,
  lucideCircleX,
  lucideInfo,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { LunaDatePickerComponent } from '../../../shared/components/luna-date-picker/luna-date-picker.component';
import type { ReservationSpaceDraft } from '../reservation-draft.service';

@Component({
  selector: 'app-reservation-date-step-desktop',
  templateUrl: './reservation-date-step-desktop.component.html',
  styleUrl: './reservation-date-step-desktop.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmSpinnerImports,
    LunaDatePickerComponent,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideCalendarCheck,
      lucideCircleCheck,
      lucideCircleX,
      lucideInfo,
    }),
  ],
})
export class ReservationDateStepDesktopComponent {
  readonly selectedSpace = input<ReservationSpaceDraft | null>(null);
  readonly selectedDate = input('');
  readonly showAvailabilityResult = input<boolean | null>(null);
  readonly isSubmitting = input(false);
  readonly isCheckingAvailability = input(false);
  readonly minPickerDate = input.required<Date>();

  readonly dateChange = output<Date>();
  readonly checkAvailability = output<void>();
  readonly back = output<void>();
  readonly submit = output<void>();
}
