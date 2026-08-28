import { Component, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLogOut } from '@ng-icons/lucide';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-logout-confirm',
  standalone: true,
  imports: [HlmAlertDialogImports, HlmButtonImports, NgIcon],
  template: `
    <hlm-alert-dialog #logoutDialog="hlmAlertDialog">
      <hlm-alert-dialog-content *hlmAlertDialogPortal="let ctx">
        <hlm-alert-dialog-header>
          <hlm-alert-dialog-media>
            <ng-icon name="lucideLogOut" />
          </hlm-alert-dialog-media>
          <h2 hlmAlertDialogTitle>Confirmar saída</h2>
          <p hlmAlertDialogDescription>
            Deseja realmente sair da sua conta?
          </p>
        </hlm-alert-dialog-header>
        <hlm-alert-dialog-footer>
          <button hlmAlertDialogCancel type="button">Cancelar</button>
          <button hlmAlertDialogAction type="button" (click)="confirmLogout()">
            Sair
          </button>
        </hlm-alert-dialog-footer>
      </hlm-alert-dialog-content>
    </hlm-alert-dialog>

    <button
      hlmBtn
      type="button"
      variant="ghost"
      size="icon"
      [class]="buttonClass()"
      [hlmAlertDialogTriggerFor]="logoutDialog"
      [attr.aria-label]="ariaLabel()"
    >
      <ng-icon name="lucideLogOut" />
    </button>
  `,
  styleUrl: './logout-confirm.component.scss',
  providers: [provideIcons({ lucideLogOut })],
})
export class LogoutConfirmComponent {
  private authService = inject(AuthService);

  buttonClass = input('header-icon-btn');
  ariaLabel = input('Sair');

  confirmLogout(): void {
    this.authService.logout();
  }
}
