import { Component, inject, input } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { IonHeader } from '@ionic/angular/standalone';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideLogOut, lucideMoonStar } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { AuthService } from '../../../services/auth.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [IonHeader, NgIcon, HlmButtonImports],
  providers: [
    provideIcons({
      lucideMoonStar,
      lucideLogOut,
      lucideChevronLeft,
    }),
  ],
  template: `
    <ion-header class="ion-no-border" [attr.data-variant]="variant()">
      <div class="header-bar">
        <div class="header-start">
          @if (showBack()) {
            <button
              hlmBtn
              type="button"
              variant="ghost"
              size="icon"
              class="header-icon-btn"
              (click)="goBack()"
              aria-label="Voltar"
            >
              <ng-icon name="lucideChevronLeft" />
            </button>
          }
          @if (showLogo()) {
            <div class="header-logo" aria-hidden="true">
              <ng-icon name="lucideMoonStar" />
            </div>
          }
          @if (title()) {
            <div class="header-brand">
              <h1 class="header-title">{{ title() }}</h1>
              @if (subtitle()) {
                <p class="header-subtitle">{{ subtitle() }}</p>
              }
            </div>
          }
          <ng-content select="[headerIntro]" />
        </div>

        <div class="header-end">
          <ng-content select="[headerActions]" />
          @if (showLogout()) {
            <button
              hlmBtn
              type="button"
              variant="ghost"
              size="icon"
              class="header-icon-btn"
              (click)="confirmLogout()"
              aria-label="Sair"
            >
              <ng-icon name="lucideLogOut" />
            </button>
          }
        </div>
      </div>

      <div class="header-body">
        <ng-content />
      </div>
    </ion-header>
  `,
  styles: `
    :host {
      display: contents;
    }

    ion-header {
      --background: #c05c46;
      --ion-toolbar-background: #c05c46;
      background: #c05c46;
      box-shadow: 0 10px 28px rgba(54, 26, 20, 0.16);
    }

    ion-header[data-variant='compact'] {
      border-radius: 0 0 1.25rem 1.25rem;
    }

    ion-header[data-variant='hero'] {
      display: flex;
      flex-direction: column;
      border-radius: 0 0 2.5rem 2.5rem;
      overflow: hidden;
      background: #c05c46;
    }

    ion-header[data-variant='hero'] .header-start {
      min-width: 0;
    }

    .header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: calc(0.65rem + env(safe-area-inset-top, 0px)) 1rem 0.65rem;
    }

    .header-start,
    .header-end {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 0;
    }

    .header-end {
      flex-shrink: 0;
    }

    .header-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.35rem;
      height: 2.35rem;
      border-radius: 0.8rem;
      background: #ffffff;
      color: #c05c46;
      font-size: 1.25rem;
    }

    .header-brand {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      min-width: 0;
    }

    .header-title {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      line-height: 1.2;
      color: #f9f6ee;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .header-subtitle {
      margin: 0;
      font-size: 0.78rem;
      font-weight: 500;
      line-height: 1.25;
      color: rgba(249, 246, 238, 0.82);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    ion-header[data-variant='hero'] .header-title {
      font-size: 1.15rem;
    }

    ion-header[data-variant='hero'] .header-subtitle {
      font-size: 0.82rem;
    }

    .header-icon-btn {
      color: #f9f6ee !important;
    }

    .header-icon-btn ng-icon {
      font-size: 1.2rem;
    }

    :host ::ng-deep .header-end ion-button {
      --color: #f9f6ee;
    }

    .header-body {
      display: none;
    }

    ion-header[data-variant='hero'] .header-body {
      display: flex;
      width: 100%;
      align-items: stretch;
      padding: 0 1rem 1.25rem;
    }

    ion-header[data-variant='hero'] .header-body:empty {
      display: none;
    }
  `,
})
export class PageHeaderComponent {
  private authService = inject(AuthService);
  private uiService = inject(UiService);
  private router = inject(Router);
  private location = inject(Location);

  readonly variant = input<'compact' | 'hero'>('compact');
  readonly title = input('');
  readonly subtitle = input('');
  readonly showLogo = input(true);
  readonly showLogout = input(true);
  readonly showBack = input(false);
  readonly backHref = input('/tabs/home');

  goBack(): void {
    if (typeof history !== 'undefined' && history.length > 1) {
      this.location.back();
      return;
    }
    void this.router.navigateByUrl(this.backHref());
  }

  async confirmLogout(): Promise<void> {
    const confirmed = await this.uiService.showConfirm(
      'Confirmar saída',
      'Deseja realmente sair da sua conta?',
      'Sair',
      'Cancelar',
    );
    if (confirmed) {
      this.authService.logout();
    }
  }
}
