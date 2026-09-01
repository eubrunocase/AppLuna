import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { IonContent, ViewWillEnter } from '@ionic/angular/standalone';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
import { DeliveryService } from '../../services/delivery.service';
import { AppNavigationService } from '../../core/navigation/app-navigation.service';
import { APP_ROUTES } from '../../core/navigation/app-routes';
import { AppShellService } from '../../core/shell/app-shell.service';
import { UserService } from '../../services/user.service';
import { UiService } from '../../shared/services/ui.service';
import { NativeCameraService } from '../../shared/services/native-camera.service';
import { ResponseUserDTO, UserRoles } from '../../core/models';
import {
  SearchableComboboxComponent,
  SearchableComboboxOption,
} from '../../shared/components/searchable-combobox/searchable-combobox.component';
import { catchError, finalize, map, of } from 'rxjs';

type DeliveryStep = 1 | 2 | 3 | 4;
type RecipientMode = 'resident' | 'custom';

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
export class DeliveryCreatePage implements OnInit, ViewWillEnter {
  private fb = inject(FormBuilder);
  private deliveryService = inject(DeliveryService);
  private userService = inject(UserService);
  private navigation = inject(AppNavigationService);
  private uiService = inject(UiService);
  private nativeCamera = inject(NativeCameraService);
  private shell = inject(AppShellService);
  private router = inject(Router);

  readonly step = signal<DeliveryStep>(1);
  readonly users = signal<ResponseUserDTO[]>([]);
  readonly recipientMode = signal<RecipientMode>('resident');
  readonly customRecipientName = signal('');
  readonly photoPreview = signal<string | null>(null);
  readonly photoBase64 = signal<string | null>(null);
  readonly isCapturingPhoto = signal(false);

  readonly recipientControl = new FormControl<string | null>(null);

  readonly isSubmitting = signal(false);

  readonly residentOptions = computed<SearchableComboboxOption[]>(() =>
    this.users().map(user => ({
      value: user.id,
      label: user.name,
      keywords: user.apartment ? `apto ${user.apartment}` : undefined,
    }))
  );

  readonly recipientLabel = computed(() => {
    if (this.recipientMode() === 'custom') {
      const name = this.customRecipientName().trim();
      return name || null;
    }

    const userId = this.recipientControl.value;
    if (!userId) return null;
    return this.users().find(user => user.id === userId)?.name ?? null;
  });

  detailsForm: FormGroup = this.fb.group({
    protocolNumber: [''],
    discrimination: [''],
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
    this.updateShell();
    this.shell.setExpandContent(null);
  }

  setRecipientMode(mode: RecipientMode): void {
    this.recipientMode.set(mode);
    if (mode === 'resident') {
      this.customRecipientName.set('');
    } else {
      this.recipientControl.setValue(null);
    }
  }

  canProceedStep1(): boolean {
    if (this.recipientMode() === 'resident') {
      return !!this.recipientControl.value;
    }
    return this.customRecipientName().trim().length > 0;
  }

  goToStep(next: DeliveryStep): void {
    if (next === 2 && !this.canProceedStep1()) return;
    this.step.set(next);
    this.updateShell();
  }

  async capturePhoto(): Promise<void> {
    await this.handlePhotoCapture(() => this.nativeCamera.takePhoto());
  }

  async pickPhotoFromGallery(): Promise<void> {
    await this.handlePhotoCapture(() => this.nativeCamera.pickFromGallery());
  }

  private async handlePhotoCapture(
    capture: () => Promise<{ previewUrl: string; base64: string } | null>
  ): Promise<void> {
    if (this.isCapturingPhoto()) {
      return;
    }

    this.isCapturingPhoto.set(true);
    try {
      const photo = await capture();
      if (!photo) {
        return;
      }
      this.photoPreview.set(photo.previewUrl);
      this.photoBase64.set(photo.base64);
    } catch {
      await this.uiService.showError('Não foi possível capturar a foto. Tente novamente.');
    } finally {
      this.isCapturingPhoto.set(false);
    }
  }

  submitDelivery(): void {
    if (!this.canProceedStep1() || !this.photoBase64() || this.isSubmitting()) {
      return;
    }

    const { protocolNumber, discrimination } = this.detailsForm.value;
    const isResident = this.recipientMode() === 'resident';

    this.isSubmitting.set(true);
    this.deliveryService.create({
      user: isResident ? this.recipientControl.value! : null,
      protocolNumber: protocolNumber?.trim() || null,
      discrimination: discrimination?.trim() || null,
      image: this.photoBase64(),
      otherRecipient: isResident ? null : this.customRecipientName().trim(),
    }).pipe(
      catchError(err => {
        const message = err?.message || err?.error?.message || 'Erro ao registrar encomenda';
        void this.uiService.showError(message);
        return of(null);
      }),
      finalize(() => this.isSubmitting.set(false)),
    ).subscribe(result => {
      if (result) {
        this.step.set(4);
        this.updateShell();
      }
    });
  }

  registerAnother(): void {
    this.resetFlow();
    this.step.set(1);
    this.updateShell();
  }

  async finish(): Promise<void> {
    await this.navigation.completeFlow(this.manageRoute());
    await this.uiService.showSuccess('Encomenda registrada com sucesso!');
  }

  private resetFlow(): void {
    this.recipientMode.set('resident');
    this.recipientControl.setValue(null);
    this.customRecipientName.set('');
    this.photoPreview.set(null);
    this.photoBase64.set(null);
    this.isSubmitting.set(false);
    this.detailsForm.reset();
  }

  private updateShell(): void {
    const step = this.step();
    const subtitles: Record<DeliveryStep, string> = {
      1: 'Etapa 1 de 3 — destinatário',
      2: 'Etapa 2 de 3 — dados opcionais',
      3: 'Etapa 3 de 3 — foto da encomenda',
      4: 'Registro concluído',
    };

    this.shell.configure({
      title: 'Nova Encomenda',
      subtitle: subtitles[step],
      showBack: step < 4,
      showLogo: false,
      showLogout: false,
      headerState: 'compact',
      progressStep: step < 4 ? step : null,
      progressTotal: step < 4 ? 3 : null,
    });
  }

  private manageRoute(): string {
    return this.router.url.includes('/app/home/')
      ? APP_ROUTES.homeDeliveriesManage
      : APP_ROUTES.deliveriesManage;
  }
}
