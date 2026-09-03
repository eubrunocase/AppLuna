import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideArrowRight,
  lucideBarcode,
  lucideCamera,
  lucideCheck,
  lucideImage,
  lucideCircleCheck,
  lucidePackage,
  lucidePlus,
  lucideUser,
  lucideUserPlus,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import {
  SearchableComboboxComponent,
  SearchableComboboxOption,
} from '../../../shared/components/searchable-combobox/searchable-combobox.component';
import type { DeliveryCreateStep, DeliveryRecipientMode } from '../mobile/delivery-create-mobile.component';

@Component({
  selector: 'app-delivery-create-desktop',
  templateUrl: './delivery-create-desktop.component.html',
  styleUrl: './delivery-create-desktop.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmFieldImports,
    HlmInputImports,
    HlmSpinnerImports,
    SearchableComboboxComponent,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideArrowRight,
      lucideBarcode,
      lucideCamera,
      lucideCheck,
      lucideImage,
      lucideCircleCheck,
      lucidePackage,
      lucidePlus,
      lucideUser,
      lucideUserPlus,
    }),
  ],
})
export class DeliveryCreateDesktopComponent {
  readonly step = input<DeliveryCreateStep>(1);
  readonly recipientMode = input<DeliveryRecipientMode>('resident');
  readonly customRecipientName = input('');
  readonly recipientLabel = input<string | null>(null);
  readonly photoPreview = input<string | null>(null);
  readonly hasCapturedPhoto = input(false);
  readonly isCapturingPhoto = input(false);
  readonly isSubmitting = input(false);
  readonly canProceedStep1 = input(false);
  readonly residentOptions = input<SearchableComboboxOption[]>([]);
  readonly recipientControl = input.required<FormControl<string | null>>();
  readonly detailsForm = input.required<FormGroup>();

  readonly recipientModeChange = output<DeliveryRecipientMode>();
  readonly customRecipientNameChange = output<string>();
  readonly goToStep = output<DeliveryCreateStep>();
  readonly capturePhoto = output<void>();
  readonly pickPhoto = output<void>();
  readonly submitDelivery = output<void>();
  readonly registerAnother = output<void>();
  readonly finish = output<void>();

  readonly steps = [
    { id: 1 as const, label: 'Destinatário' },
    { id: 2 as const, label: 'Dados' },
    { id: 3 as const, label: 'Foto' },
  ];
}
