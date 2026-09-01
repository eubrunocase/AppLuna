import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { IonContent, ViewWillEnter } from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBarcode,
  lucidePackage,
  lucidePlusCircle,
  lucideShieldCheck,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { DeliveryService } from '../../services/delivery.service';
import { AppNavigationService } from '../../core/navigation/app-navigation.service';
import { APP_ROUTES } from '../../core/navigation/app-routes';
import { AppShellService } from '../../core/shell/app-shell.service';
import { UserService } from '../../services/user.service';
import { UiService } from '../../shared/services/ui.service';
import { ResponseUserDTO, UserRoles } from '../../core/models';
import {
  SearchableComboboxComponent,
  SearchableComboboxOption,
} from '../../shared/components/searchable-combobox/searchable-combobox.component';
import { catchError, map, of } from 'rxjs';

@Component({
  selector: 'app-delivery-create',
  templateUrl: './delivery-create.page.html',
  styleUrl: './delivery-create.page.scss',
  standalone: true,
  imports: [
    IonContent,
    ReactiveFormsModule,
    NgIcon,
    HlmButtonImports,
    HlmFieldImports,
    HlmInputImports,
    HlmSpinnerImports,
    SearchableComboboxComponent,
  ],
  providers: [
    provideIcons({
      lucideBarcode,
      lucidePackage,
      lucidePlusCircle,
      lucideShieldCheck,
    }),
  ],
})
export class DeliveryCreatePage implements OnInit, ViewWillEnter {
  private fb = inject(FormBuilder);
  private deliveryService = inject(DeliveryService);
  private userService = inject(UserService);
  private navigation = inject(AppNavigationService);
  private uiService = inject(UiService);
  private shell = inject(AppShellService);
  private router = inject(Router);

  users = signal<ResponseUserDTO[]>([]);
  isSubmitting = false;

  readonly residentOptions = computed<SearchableComboboxOption[]>(() =>
    this.users().map(user => ({
      value: user.id,
      label: user.name,
      keywords: user.apartment ? `apto ${user.apartment}` : undefined,
    }))
  );

  form: FormGroup = this.fb.group({
    user: ['', Validators.required],
    protocolNumber: [null],
    discrimination: [null],
    otherRecipient: [null]
  });

  ngOnInit(): void {
    this.userService.getAll().pipe(
      map(users => users.filter(u => u.role === UserRoles.RESIDENTE_ROLE)),
      catchError(() => of([]))
    ).subscribe(users => {
      this.users.set(users);
    });
  }

  ionViewWillEnter(): void {
    this.shell.configure({
      title: 'Nova Encomenda',
      showBack: true,
      showLogo: false,
      showLogout: false,
      headerState: 'compact',
    });
    this.shell.setExpandContent(null);
  }

  private manageRoute(): string {
    return this.router.url.includes('/app/home/')
      ? APP_ROUTES.homeDeliveriesManage
      : APP_ROUTES.deliveriesManage;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { user, protocolNumber, discrimination, otherRecipient } = this.form.value;

    this.deliveryService.create({
      user,
      protocolNumber: protocolNumber || null,
      discrimination: discrimination || null,
      otherRecipient: otherRecipient || null
    }).pipe(
      catchError(err => {
        this.uiService.showError(err.error?.message || 'Erro ao registrar encomenda');
        return of(null);
      })
    ).subscribe(async result => {
      this.isSubmitting = false;
      if (result) {
        await this.navigation.completeFlow(this.manageRoute());
        await this.uiService.showSuccess('Encomenda registrada com sucesso!');
      }
    });
  }
}
