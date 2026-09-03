import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular/standalone';
import { UserService } from '../../services/user.service';
import { AppNavigationService } from '../../core/navigation/app-navigation.service';
import { APP_ROUTES } from '../../core/navigation/app-routes';
import { AppShellService } from '../../core/shell/app-shell.service';
import { LayoutService } from '../../core/layout/layout.service';
import { UiService } from '../../shared/services/ui.service';
import { CelebrationService } from '../../shared/services/celebration.service';
import { RequestUserDTO, ResponseUserDTO, UserRoles } from '../../core/models';
import { UserFormDesktopComponent } from './desktop/user-form-desktop.component';
import {
  UserFormMobileComponent,
  type UserFormStep,
} from './mobile/user-form-mobile.component';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.page.html',
  standalone: true,
  imports: [UserFormDesktopComponent, UserFormMobileComponent],
})
export class UserFormPage implements OnInit, ViewWillEnter {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private navigation = inject(AppNavigationService);
  private shell = inject(AppShellService);
  private uiService = inject(UiService);
  private celebration = inject(CelebrationService);
  readonly layout = inject(LayoutService);

  readonly step = signal<UserFormStep>(1);
  readonly isEdit = signal(false);
  readonly isLoadingUser = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitted = signal(false);
  readonly showPassword = signal(false);
  readonly selectedRole = signal<string>(UserRoles.RESIDENT_ROLE);

  private editingUser: ResponseUserDTO | null = null;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    apartment: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(4)]],
  });

  readonly roleOptions = [
    {
      value: UserRoles.RESIDENT_ROLE,
      label: 'Morador',
      hint: 'Reservas, encomendas e ocorrências',
      icon: 'lucideUser',
      inputId: 'user-role-resident',
    },
    {
      value: UserRoles.EMPLOYEE,
      label: 'Funcionário',
      hint: 'Portaria, encomendas e equipamentos',
      icon: 'lucideBriefcase',
      inputId: 'user-role-employee',
    },
    {
      value: UserRoles.ADMIN_ROLE,
      label: 'Síndico',
      hint: 'Aprovações, usuários e relatórios',
      icon: 'lucideShieldCheck',
      inputId: 'user-role-admin',
    },
  ];

  canProceedStep1(): boolean {
    const nameOk = this.form.controls.name.valid;
    const apartmentOk = this.form.controls.apartment.valid;
    const emailOk = this.form.controls.email.valid || this.form.controls.email.disabled;
    const password = this.form.controls.password.value ?? '';
    const passwordOk = this.isEdit()
      ? password.length === 0 || this.form.controls.password.valid
      : this.form.controls.password.valid;
    return nameOk && apartmentOk && emailOk && passwordOk;
  }

  canSubmit(): boolean {
    return this.canProceedStep1() && !!this.selectedRole();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.form.controls.password.addValidators(Validators.required);
      this.form.controls.password.updateValueAndValidity();
      return;
    }

    this.isEdit.set(true);
    this.isLoadingUser.set(true);
    this.userService.getById(id).pipe(
      catchError(() => of(null)),
      finalize(() => this.isLoadingUser.set(false)),
    ).subscribe(user => {
      if (!user) {
        void this.uiService.showError('Usuário não encontrado');
        void this.navigation.completeFlow(APP_ROUTES.homeAdminUsers);
        return;
      }
      this.editingUser = user;
      this.selectedRole.set(user.role);
      this.form.patchValue({
        name: user.name,
        apartment: user.apartment,
        email: user.email,
        password: '',
      });
      this.form.controls.email.disable();
      this.updateShell();
    });
  }

  ionViewWillEnter(): void {
    this.updateShell();
    this.shell.setExpandContent(null);
  }

  goToStep(next: UserFormStep): void {
    if (next === 2 && !this.canProceedStep1()) {
      this.submitted.set(true);
      this.form.markAllAsTouched();
      return;
    }
    this.step.set(next);
    this.updateShell();
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    if (this.isEdit()) {
      if (!this.canProceedStep1() || this.isSubmitting() || !this.editingUser) {
        return;
      }
      this.save(this.buildPayload(this.editingUser));
      return;
    }

    if (!this.canSubmit() || this.isSubmitting()) {
      return;
    }
    this.save(this.buildPayload());
  }

  private buildPayload(existing?: ResponseUserDTO): RequestUserDTO {
    const value = this.form.getRawValue();
    return {
      name: (value.name ?? '').trim(),
      apartment: (value.apartment ?? '').trim(),
      email: existing?.email ?? (value.email ?? '').trim(),
      password: value.password ?? '',
      role: existing?.role ?? this.selectedRole(),
    };
  }

  private save(payload: RequestUserDTO): void {
    this.isSubmitting.set(true);
    const request$ = this.editingUser
      ? this.userService.update(this.editingUser.id, payload)
      : this.userService.create(payload);

    request$.pipe(
      catchError(error => {
        const message = error?.error?.message
          || error?.error?.validationErrors?.email
          || error?.message
          || (this.isEdit() ? 'Erro ao salvar usuário' : 'Erro ao criar usuário');
        void this.uiService.showError(message);
        return of(null);
      }),
      finalize(() => this.isSubmitting.set(false)),
    ).subscribe(async result => {
      if (result) {
        if (!this.isEdit()) {
          this.celebration.celebrateSuccess();
        }
        await this.navigation.completeFlow(APP_ROUTES.homeAdminUsers);
        await this.uiService.showSuccess(this.isEdit() ? 'Usuário atualizado' : 'Usuário criado');
      }
    });
  }

  private updateShell(): void {
    if (this.isEdit()) {
      this.shell.configure({
        title: 'Editar usuário',
        subtitle: this.editingUser?.name ?? 'Atualize os dados cadastrais',
        showBack: true,
        showLogo: false,
        showLogout: false,
        headerState: 'compact',
        progressStep: null,
        progressTotal: null,
      });
      return;
    }

    this.shell.configure({
      title: 'Novo usuário',
      subtitle: this.step() === 1
        ? 'Etapa 1 de 2 — dados da pessoa'
        : 'Etapa 2 de 2 — escolha o papel',
      showBack: true,
      showLogo: false,
      showLogout: false,
      headerState: 'compact',
      progressStep: this.step(),
      progressTotal: 2,
    });
  }
}
