import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import type { OccurrenceCreateStep } from '../mobile/occurrence-create-mobile.component';

@Component({
  selector: 'app-occurrence-create-desktop',
  templateUrl: './occurrence-create-desktop.component.html',
  styleUrl: './occurrence-create-desktop.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
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
export class OccurrenceCreateDesktopComponent {
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

  readonly steps = [
    { id: 1 as const, label: 'Descrição' },
    { id: 2 as const, label: 'Data e hora' },
    { id: 3 as const, label: 'Confirmação' },
  ];
}
