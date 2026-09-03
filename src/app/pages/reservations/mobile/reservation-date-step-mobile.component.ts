import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideCalendarCheck,
  lucideCircleCheck,
  lucideCircleX,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { LunaDatePickerComponent } from '../../../shared/components/luna-date-picker/luna-date-picker.component';
import type { ReservationSpaceDraft } from '../reservation-draft.service';

@Component({
  selector: 'app-reservation-date-step-mobile',
  templateUrl: './reservation-date-step-mobile.component.html',
  styleUrl: '../reservation-flow.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonContent,
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
    }),
  ],
})
export class ReservationDateStepMobileComponent {
  readonly selectedSpace = input<ReservationSpaceDraft | null>(null);
  readonly showAvailabilityResult = input<boolean | null>(null);
  readonly isSubmitting = input(false);
  readonly isCheckingAvailability = input(false);
  readonly minPickerDate = input.required<Date>();

  readonly dateChange = output<Date>();
  readonly checkAvailability = output<void>();
  readonly back = output<void>();
  readonly submit = output<void>();
}
