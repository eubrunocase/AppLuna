import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideArrowRight,
  lucideCheck,
  lucideTriangleAlert,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { LunaDatePickerComponent } from '../../../shared/components/luna-date-picker/luna-date-picker.component';
import { LunaTimePickerComponent } from '../../../shared/components/luna-time-picker/luna-time-picker.component';

export type OccurrenceCreateStep = 1 | 2 | 3;

@Component({
  selector: 'app-occurrence-create-mobile',
  templateUrl: './occurrence-create-mobile.component.html',
  styleUrl: './occurrence-create-mobile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonContent,
    FormsModule,
    NgIcon,
    HlmButtonImports,
    HlmFieldImports,
    HlmSpinnerImports,
    HlmTextareaImports,
    LunaDatePickerComponent,
    LunaTimePickerComponent,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideArrowRight,
      lucideCheck,
      lucideTriangleAlert,
    }),
  ],
})
export class OccurrenceCreateMobileComponent {
  readonly step = input<OccurrenceCreateStep>(1);
  readonly description = input('');
  readonly isSubmitting = input(false);
  readonly canProceedStep1 = input(false);
  readonly canProceedStep2 = input(false);
  readonly canSubmit = input(false);
  readonly minPickerDate = input.required<Date>();
  readonly maxPickerDate = input.required<Date>();

  readonly descriptionChange = output<string>();
  readonly dateChange = output<Date>();
  readonly timeChange = output<string>();
  readonly goToStep = output<OccurrenceCreateStep>();
  readonly submit = output<void>();
}
