import { Component, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLogOut } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { AuthService } from '../../../services/auth.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-logout-confirm',
  standalone: true,
  imports: [HlmButtonImports, NgIcon, ConfirmDialogComponent],
  template: `
    <app-confirm-dialog
      #confirm
      title="Confirmar saída"
      description="Deseja realmente sair da sua conta?"
      confirmLabel="Sair"
      icon="lucideLogOut"
      (confirmed)="confirmLogout()"
    />

    <button
      hlmBtn
      type="button"
      variant="ghost"
      size="icon"
      [class]="buttonClass()"
      [attr.aria-label]="ariaLabel()"
      (click)="confirm.open()"
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
