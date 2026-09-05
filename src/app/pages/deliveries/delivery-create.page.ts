import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular/standalone';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DeliveryService } from '../../services/delivery.service';
import { AppNavigationService } from '../../core/navigation/app-navigation.service';
import { APP_ROUTES } from '../../core/navigation/app-routes';
import { AppShellService } from '../../core/shell/app-shell.service';
import { LayoutService } from '../../core/layout/layout.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../shared/services/ui.service';
import { CapturedPhoto, NativeCameraService } from '../../shared/services/native-camera.service';
import { isResidentRole, ResponseUserDTO } from '../../core/models';
import { SearchableComboboxOption } from '../../shared/components/searchable-combobox/searchable-combobox.component';
import { DeliveryCreateDesktopComponent } from './desktop/delivery-create-desktop.component';
import {
  DeliveryCreateMobileComponent,
  type DeliveryCreateStep,
  type DeliveryRecipientMode,
} from './mobile/delivery-create-mobile.component';
import { catchError, finalize, map, of } from 'rxjs';

type DeliveryStep = DeliveryCreateStep;
type RecipientMode = DeliveryRecipientMode;

@Component({
  selector: 'app-delivery-create',
  templateUrl: './delivery-create.page.html',
  standalone: true,
  imports: [DeliveryCreateDesktopComponent, DeliveryCreateMobileComponent],
})
export class DeliveryCreatePage implements OnInit, ViewWillEnter {
  private fb = inject(FormBuilder);
  private deliveryService = inject(DeliveryService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private navigation = inject(AppNavigationService);
  private uiService = inject(UiService);
  private nativeCamera = inject(NativeCameraService);
  private shell = inject(AppShellService);
  private router = inject(Router);
  readonly layout = inject(LayoutService);

  readonly step = signal<DeliveryStep>(1);
  readonly users = signal<ResponseUserDTO[]>([]);
  readonly recipientMode = signal<RecipientMode>('resident');
  readonly customRecipientName = signal('');
  readonly photoPreview = signal<string | null>(null);
  readonly capturedPhoto = signal<CapturedPhoto | null>(null);
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
      map(users => users.filter(u => isResidentRole(u.role))),
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
    capture: () => Promise<CapturedPhoto | null>
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
      const previous = this.photoPreview();
      if (previous?.startsWith('blob:')) {
        URL.revokeObjectURL(previous);
      }
      this.photoPreview.set(photo.previewUrl);
      this.capturedPhoto.set(photo);
    } catch {
      await this.uiService.showError('Não foi possível capturar a foto. Tente novamente.');
    } finally {
      this.isCapturingPhoto.set(false);
    }
  }

  submitDelivery(): void {
    if (!this.canProceedStep1() || !this.capturedPhoto() || this.isSubmitting()) {
      return;
    }

    const photo = this.capturedPhoto()!;
    const { protocolNumber, discrimination } = this.detailsForm.value;
    const isResident = this.recipientMode() === 'resident';
    const currentUser = this.authService.getCurrentUser();
    const userId = isResident ? this.recipientControl.value : currentUser?.id;

    if (!userId) {
      void this.uiService.showError('Não foi possível identificar o destinatário da encomenda.');
      return;
    }

    this.isSubmitting.set(true);
    this.deliveryService
      .createWithPhoto(
        {
          user: userId,
          protocolNumber: protocolNumber?.trim() || null,
          discrimination: discrimination?.trim() || null,
          otherRecipient: isResident ? null : this.customRecipientName().trim(),
        },
        photo.blob,
        photo.fileName,
        photo.contentType,
      )
      .pipe(
        catchError((err) => {
          const message = err?.message || err?.error?.message || 'Erro ao registrar encomenda';
          void this.uiService.showError(message);
          return of(null);
        }),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe((result) => {
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
    const previous = this.photoPreview();
    if (previous?.startsWith('blob:')) {
      URL.revokeObjectURL(previous);
    }
    this.photoPreview.set(null);
    this.capturedPhoto.set(null);
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
