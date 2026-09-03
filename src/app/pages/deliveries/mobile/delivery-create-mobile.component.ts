import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
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

export type DeliveryCreateStep = 1 | 2 | 3 | 4;
export type DeliveryRecipientMode = 'resident' | 'custom';

@Component({
  selector: 'app-delivery-create-mobile',
  templateUrl: './delivery-create-mobile.component.html',
  styleUrl: './delivery-create-mobile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonContent,
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
export class DeliveryCreateMobileComponent {
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
}
