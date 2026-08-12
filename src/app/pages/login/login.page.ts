import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../shared/services/ui.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-login',
  template: `
    <ion-content class="login-content">
      <div class="login-container">
        <div class="logo-section">
          <div class="logo-icon">
            <span class="moon-emoji" aria-hidden="true">🌙</span>
          </div>
          <h1>LunaLink</h1>
          <p>Sistema de Gestão do condomínio Luna</p>
        </div>
        
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-card">
            <div class="form-title">
              <h2>Acesse sua conta</h2>
              <p>Informe suas credenciais para continuar</p>
            </div>

            <ion-item lines="none">
              <ion-icon slot="start" name="mail-outline"></ion-icon>
              <ion-input 
                formControlName="email"
                type="email"
                label="Email"
                labelPlacement="floating"
                placeholder="seu@email.com"
                autocomplete="email">
              </ion-input>
            </ion-item>
            <p class="error-text" *ngIf="showError('email')">
              {{ getErrorMessage('email') }}
            </p>

            <ion-item lines="none">
              <ion-icon slot="start" name="lock-closed-outline"></ion-icon>
              <ion-input 
                formControlName="password"
                [type]="showPassword ? 'text' : 'password'"
                label="Senha"
                labelPlacement="floating"
                placeholder="Sua senha"
                autocomplete="current-password">
              </ion-input>
              <ion-icon 
                slot="end" 
                [name]="showPassword ? 'eye-off-outline' : 'eye-outline'"
                (click)="togglePassword()"
                class="password-toggle">
              </ion-icon>
            </ion-item>
            <p class="error-text" *ngIf="showError('password')">
              {{ getErrorMessage('password') }}
            </p>

            <ion-button 
              expand="block" 
              type="submit" 
              [disabled]="form.invalid || isLoading"
              class="login-button">
              <ion-spinner *ngIf="isLoading" name="crescent"></ion-spinner>
              <span *ngIf="!isLoading">Entrar</span>
            </ion-button>
          </div>
        </form>

        <div class="footer">
          <p>Precisa de ajuda? Entre em contato com o síndico.</p>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .login-content {
      --background:
        radial-gradient(circle at 20% 15%, rgba(255, 145, 0, 0.35) 0%, transparent 42%),
        radial-gradient(circle at 80% 90%, rgba(255, 92, 0, 0.2) 0%, transparent 46%),
        linear-gradient(165deg, #ff7a00 0%, #2a0f02 42%, #050505 100%);
    }

    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100%;
      padding: 24px;
    }

    .logo-section {
      text-align: center;
      margin-bottom: 40px;
    }

    .logo-icon {
      width: 108px;
      height: 108px;
      background: rgba(255, 255, 255, 0.14);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(12px);
    }

    .moon-emoji {
      font-size: 42px;
      line-height: 1;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));
    }

    .logo-section h1 {
      font-size: 32px;
      font-weight: 700;
      color: #fff8f0;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      margin: 0 0 8px 0;
    }

    .logo-section p {
      font-size: 14px;
      color: rgba(255, 246, 235, 0.92);
      margin: 0;
    }

    .form-card {
      width: 100%;
      max-width: 400px;
      background: rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      padding: 32px 24px;
      border: 1px solid rgba(255, 255, 255, 0.28);
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.34);
      backdrop-filter: blur(14px);
    }

    .form-title {
      text-align: center;
      margin-bottom: 24px;
    }

    .form-title h2 {
      font-size: 20px;
      font-weight: 600;
      color: #fff9f2;
      margin: 0 0 4px 0;
    }

    .form-title p {
      font-size: 13px;
      color: rgba(255, 248, 240, 0.9);
      margin: 0;
    }

    ion-item {
      --background: rgba(255, 255, 255, 0.16);
      --border-radius: 12px;
      --padding-start: 12px;
      --padding-end: 12px;
      --inner-padding-end: 8px;
      --highlight-height: 0;
      --highlight-color-focused: transparent;
      --inner-border-width: 0;
      --border-width: 0;
      --inner-box-shadow: none;
      color: #fffaf5;
      border: 1px solid rgba(255, 255, 255, 0.24);
      margin-bottom: 8px;
    }

    ion-item:first-child {
      margin-top: 8px;
    }

    ion-input {
      --background: transparent;
      --color: #fffaf5;
      --placeholder-color: rgba(255, 250, 245, 0.78);
      --label-color: rgba(255, 250, 245, 0.9);
      border: 0;
      box-shadow: none;
    }

    ion-icon {
      color: #fff7ee;
      margin-right: 8px;
    }

    .password-toggle {
      cursor: pointer;
      color: #fff8f1;
      font-size: 20px;
      padding: 8px;
    }

    .error-text {
      color: #ffd6d6;
      font-size: 12px;
      font-weight: 600;
      margin: 0 0 8px 16px;
    }

    .login-button {
      margin-top: 24px;
      --background: #ff7a00;
      --background-hover: #ff8d21;
      --color: #1f1209;
      --border-radius: 12px;
      height: 52px;
      font-weight: 700;
      font-size: 16px;
    }

    .footer {
      margin-top: 32px;
      text-align: center;
    }

    .footer p {
      font-size: 12px;
      color: rgba(255, 245, 235, 0.86);
      margin: 0;
    }
  `],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule]
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private uiService = inject(UiService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  isLoading = false;
  showPassword = false;

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  showError(field: string): boolean {
    const control = this.form.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getErrorMessage(field: string): string {
    const control = this.form.get(field);
    if (control?.hasError('required')) return 'Campo obrigatório';
    if (control?.hasError('email')) return 'Email inválido';
    if (control?.hasError('minlength')) return 'Mínimo 4 caracteres';
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    const { email, password } = this.form.value;

    this.authService.login({ email, password }).pipe(
      catchError(error => {
        const message = error?.message || 'Credenciais inválidas';
        this.uiService.showError(message);
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(user => {
      if (user) {
        this.router.navigate(['/tabs/home']);
      }
    });
  }
}
