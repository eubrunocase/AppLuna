import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { AppNavigationService } from '../../core/navigation/app-navigation.service';
import { APP_ROUTES } from '../../core/navigation/app-routes';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2,
  lucideEye,
  lucideEyeOff,
  lucideLock,
  lucideMail,
  lucideMoonStar,
  lucideShieldCheck,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../shared/services/ui.service';

@Component({
  selector: 'app-login',
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
  ],
  providers: [
    provideIcons({
      lucideBuilding2,
      lucideEye,
      lucideEyeOff,
      lucideLock,
      lucideMail,
      lucideMoonStar,
      lucideShieldCheck,
    }),
  ],
  template: `
    @if (showSplash) {
      <div #splashRoot class="splash" aria-hidden="true">
        <div #splashLogo class="splash-logo">
          <ng-icon name="lucideMoonStar" class="splash-logo-icon" />
        </div>
      </div>
    }

    <ion-content [fullscreen]="true" class="login-content">
      <div #loginShell class="login-shell">
        <section class="form-column">
          <div #loginCard class="form-wrap">
            <hlm-card class="login-card">
              <div class="card-brand">
                <ng-icon name="lucideMoonStar" class="brand-icon" aria-hidden="true" />
                <h1 class="welcome-title">Bem vindo</h1>
                <p class="welcome-subtitle">
                  Faça o login para acesso ao
                  <span class="welcome-brand">Lunalink</span>
                </p>
              </div>

              <div hlmCardContent>
                <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
                  <hlm-field-group>
                    <hlm-field>
                      <div class="input-with-icon">
                        <ng-icon name="lucideMail" class="field-icon" aria-hidden="true" />
                        <input
                          hlmInput
                          id="login-email"
                          type="email"
                          formControlName="email"
                          autocomplete="email"
                          placeholder="seu@email.com"
                          aria-label="E-mail"
                          class="login-input pl-9"
                          [attr.aria-invalid]="showError('email')"
                        />
                      </div>
                      @if (showError('email')) {
                        <hlm-field-error class="login-field-error" [forceShow]="true">
                          {{ getErrorMessage('email') }}
                        </hlm-field-error>
                      }
                    </hlm-field>

                    <hlm-field>
                      <div class="input-with-icon">
                        <ng-icon name="lucideLock" class="field-icon" aria-hidden="true" />
                        <input
                          hlmInput
                          id="login-password"
                          [type]="showPassword ? 'text' : 'password'"
                          formControlName="password"
                          autocomplete="current-password"
                          placeholder="Sua senha"
                          aria-label="Senha"
                          class="login-input pl-9 pr-10"
                          [attr.aria-invalid]="showError('password')"
                        />
                        <button
                          hlmBtn
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          class="password-toggle text-brand-terracotta"
                          (click)="togglePassword()"
                          [attr.aria-label]="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                        >
                          <ng-icon [name]="showPassword ? 'lucideEyeOff' : 'lucideEye'" />
                        </button>
                      </div>
                      @if (showError('password')) {
                        <hlm-field-error class="login-field-error" [forceShow]="true">
                          {{ getErrorMessage('password') }}
                        </hlm-field-error>
                      }
                    </hlm-field>

                    <hlm-field>
                      <button
                        hlmBtn
                        type="submit"
                        class="login-submit w-full gap-2"
                        [disabled]="isLoading"
                        [attr.aria-busy]="isLoading"
                      >
                        @if (isLoading) {
                          <hlm-spinner aria-label="Entrando" />
                          <span>Entrando…</span>
                        } @else {
                          <span>Entrar</span>
                        }
                      </button>
                    </hlm-field>
                  </hlm-field-group>
                </form>
              </div>

              <hlm-card-footer class="flex-col items-stretch gap-3 border-t border-border/60 pt-4">
                <p class="text-muted-foreground text-center text-xs leading-relaxed">
                  Precisa de ajuda? Fale com o síndico ou a administração do condomínio.
                </p>
                <div class="trust-row">
                  <ng-icon name="lucideShieldCheck" class="trust-icon" aria-hidden="true" />
                  <span>Acesso seguro para moradores e equipe</span>
                </div>
              </hlm-card-footer>
            </hlm-card>
          </div>
        </section>

        <aside class="visual-column" aria-hidden="true">
          <div class="visual-glow"></div>
          <div class="visual-content">
            <div class="visual-badge">
              <ng-icon name="lucideBuilding2" />
              <span>Condomínio Luna</span>
            </div>
            <img
              src="assets/illustrations/authentication.svg"
              alt=""
              class="visual-illustration"
            />
            <blockquote class="visual-quote">
              <p>Reservas, entregas e ocorrências em um só lugar — simples e transparente.</p>
            </blockquote>
          </div>
        </aside>
      </div>
    </ion-content>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .login-content {
      --background: #f9f6ee;
    }

    .splash {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #c05c46;
      transform-origin: center center;
      pointer-events: none;
      will-change: opacity, transform;
    }

    .splash-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 5.25rem;
      height: 5.25rem;
      border-radius: 1.25rem;
      background: #ffffff;
      color: #c05c46;
      box-shadow: 0 12px 32px rgba(54, 26, 20, 0.18);
      will-change: transform, opacity;
    }

    .splash-logo-icon {
      font-size: 2.1rem;
    }

    .login-shell {
      min-height: 100%;
      display: flex;
      flex-direction: column;
      background: #f9f6ee;
      opacity: 0;
    }

    .form-column {
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: center;
      padding: 1.25rem 1.25rem 2rem;
    }

    .form-wrap {
      width: 100%;
      max-width: 24rem;
      margin: 0 auto;
    }

    .login-card {
      width: 100%;
      border-color: var(--brand-soft-terracotta, #f2e4da);
      box-shadow: 0 14px 40px color-mix(in oklab, var(--foreground) 8%, transparent);
      background: #ffffff;
    }

    .card-brand {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 1.5rem 1.5rem 0;
      margin-bottom: 16px;
    }

    .brand-icon {
      font-size: 2.65rem;
      width: 1em;
      height: 1em;
      color: #c05c46;
      margin-bottom: 0.7rem;
    }

    .welcome-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1.2;
      color: #c05c46;
    }

    .welcome-subtitle {
      margin: 0.4rem 0 0;
      font-size: 0.95rem;
      font-weight: 400;
      line-height: 1.45;
      color: var(--foreground);
    }

    .welcome-brand {
      color: #c05c46;
      font-weight: 600;
    }

    .login-field-error {
      color: #dc2626 !important;
    }

    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }

    .field-icon {
      position: absolute;
      left: 0.85rem;
      z-index: 1;
      font-size: 1.05rem;
      color: #c05c46;
      pointer-events: none;
    }

    .login-input {
      height: 3rem !important;
      min-height: 3rem;
      font-size: 1rem !important;
    }

    .input-with-icon input {
      position: relative;
      z-index: 0;
      pointer-events: auto;
    }

    .password-toggle {
      position: absolute;
      right: 0.35rem;
      z-index: 2;
      color: #c05c46 !important;
    }

    .password-toggle ng-icon {
      color: #c05c46 !important;
    }

    .login-submit {
      height: 3.15rem !important;
      min-height: 3.15rem;
      font-weight: 600 !important;
    }

    .login-submit,
    .login-submit span {
      color: #f9f6ee !important;
      font-weight: 600 !important;
    }

    .trust-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      font-size: 0.7rem;
      color: var(--muted-foreground);
    }

    .trust-icon {
      font-size: 0.9rem;
      color: var(--brand-gold, #e3a847);
    }

    .visual-column {
      display: none;
    }

    @media (min-width: 1024px) {
      .login-shell {
        flex-direction: row-reverse;
        min-height: 100dvh;
      }

      .form-column {
        width: min(44%, 34rem);
        max-width: 34rem;
        padding: 2rem 2.5rem;
      }

      .form-wrap {
        margin: 0;
        max-width: 26rem;
      }

      .visual-column {
        display: block;
        position: relative;
        flex: 1;
        overflow: hidden;
        background: #f2e4da;
      }

      .visual-glow {
        position: absolute;
        inset: 12% 18%;
        border-radius: 2rem;
        background: color-mix(in oklab, white 55%, transparent);
        filter: blur(40px);
        opacity: 0.7;
      }

      .visual-content {
        position: relative;
        z-index: 1;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1.75rem;
        padding: 3rem;
        text-align: center;
      }

      .visual-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.4rem 0.85rem;
        border-radius: 999px;
        background: #ffffff;
        border: 1px solid color-mix(in oklab, var(--brand-terracotta) 18%, transparent);
        color: var(--foreground);
        font-size: 0.8rem;
        font-weight: 600;
      }

      .visual-illustration {
        width: min(72%, 28rem);
        height: auto;
        filter: drop-shadow(0 18px 30px color-mix(in oklab, var(--foreground) 12%, transparent));
      }

      .visual-quote {
        margin: 0;
        max-width: 22rem;
        font-size: 1rem;
        line-height: 1.5;
        color: var(--foreground);
        font-weight: 500;
      }

      .visual-quote p {
        margin: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .splash,
      .splash-logo {
        animation: none !important;
        transition: none !important;
      }
    }
  `,
})
export class LoginPage implements AfterViewInit, OnDestroy {
  @ViewChild('splashRoot') private splashRoot?: ElementRef<HTMLElement>;
  @ViewChild('splashLogo') private splashLogo?: ElementRef<HTMLElement>;
  @ViewChild('loginShell') private loginShell?: ElementRef<HTMLElement>;
  @ViewChild('loginCard') private loginCard?: ElementRef<HTMLElement>;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private uiService = inject(UiService);
  private navigation = inject(AppNavigationService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  private timeline?: { kill: () => void };

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  isLoading = false;
  showPassword = false;
  showSplash = true;

  ngAfterViewInit(): void {
    // Espera o próximo frame para o layout estabilizar (comportamento nativo)
    requestAnimationFrame(() => {
      this.zone.runOutsideAngular(() => {
        void this.playSplash();
      });
    });
  }

  ngOnDestroy(): void {
    this.timeline?.kill();
  }

  private async playSplash(): Promise<void> {
    const root = this.splashRoot?.nativeElement;
    const logo = this.splashLogo?.nativeElement;
    const shell = this.loginShell?.nativeElement;
    const card = this.loginCard?.nativeElement;
    if (!root || !logo || !shell) return;

    const { default: gsap } = await import('gsap');

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      gsap.set(shell, { opacity: 1 });
      this.zone.run(() => {
        this.showSplash = false;
      });
      return;
    }

    // Estilo app nativo: splash estático → hold → crossfade suave
    gsap.set(logo, { opacity: 0, scale: 0.92 });
    gsap.set(shell, { opacity: 0 });
    if (card) {
      gsap.set(card, { opacity: 0, y: 12 });
    }

    const timeline = gsap.timeline();
    this.timeline = timeline;

    timeline
      .to(logo, {
        opacity: 1,
        scale: 1,
        duration: 0.45,
        ease: 'power2.out',
      })
      .to({}, { duration: 0.55 })
      .add(() => {
        root.style.pointerEvents = 'none';
      })
      .to(
        root,
        {
          opacity: 0,
          scale: 1.04,
          duration: 0.48,
          ease: 'power2.inOut',
          onComplete: () => {
            this.zone.run(() => {
              this.showSplash = false;
            });
          },
        },
        'reveal',
      )
      .to(
        logo,
        {
          scale: 0.96,
          opacity: 0,
          duration: 0.35,
          ease: 'power2.inOut',
        },
        'reveal',
      )
      .to(
        shell,
        {
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
        },
        'reveal+=0.08',
      );

    if (card) {
      timeline.to(
        card,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power3.out',
        },
        'reveal+=0.12',
      );
    }
  }

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
    if (control?.hasError('email')) return 'E-mail inválido';
    if (control?.hasError('minlength')) return 'Mínimo 4 caracteres';
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.isLoading) return;

    this.isLoading = true;
    this.cdr.markForCheck();

    const { email, password } = this.form.value;

    this.authService
      .login({ email, password })
      .pipe(
        catchError((error) => {
          const message = error?.message || 'Credenciais inválidas';
          this.stopLoading();
          void this.uiService.showError(message);
          return of(null);
        }),
        finalize(() => this.stopLoading()),
      )
      .subscribe((user) => {
        if (user) {
          this.stopLoading();
          void this.navigation.resetToHome();
        }
      });
  }

  private stopLoading(): void {
    if (!this.isLoading) return;
    this.isLoading = false;
    this.cdr.detectChanges();
  }
}
