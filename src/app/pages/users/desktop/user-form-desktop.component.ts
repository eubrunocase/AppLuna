import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideArrowRight,
  lucideBriefcase,
  lucideBuilding2,
  lucideCheck,
  lucideEye,
  lucideEyeOff,
  lucideLock,
  lucideMail,
  lucideShieldCheck,
  lucideUser,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import type { UserFormRoleOption, UserFormStep } from '../mobile/user-form-mobile.component';

@Component({
  selector: 'app-user-form-desktop',
  templateUrl: './user-form-desktop.component.html',
  styleUrl: './user-form-desktop.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIcon,
    HlmButtonImports,
    HlmFieldImports,
    HlmInputImports,
    HlmRadioGroupImports,
    HlmSpinnerImports,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideArrowRight,
      lucideBriefcase,
      lucideBuilding2,
      lucideCheck,
      lucideEye,
      lucideEyeOff,
      lucideLock,
      lucideMail,
      lucideShieldCheck,
      lucideUser,
    }),
  ],
})
export class UserFormDesktopComponent {
  readonly step = input<UserFormStep>(1);
  readonly isEdit = input(false);
  readonly isLoadingUser = input(false);
  readonly isSubmitting = input(false);
  readonly submitted = input(false);
  readonly showPassword = input(false);
  readonly selectedRole = input('');
  readonly canProceedStep1 = input(false);
  readonly canSubmit = input(false);
  readonly form = input.required<FormGroup>();
  readonly roleOptions = input<UserFormRoleOption[]>([]);

  readonly showPasswordChange = output<boolean>();
  readonly selectedRoleChange = output<string>();
  readonly goToStep = output<UserFormStep>();
  readonly submit = output<void>();

  readonly steps = [
    { id: 1 as const, label: 'Dados' },
    { id: 2 as const, label: 'Papel' },
  ];

  showError(field: 'name' | 'apartment' | 'email' | 'password'): boolean {
    const control = this.form().controls[field];
    return control.invalid && (control.touched || this.submitted());
  }
}
