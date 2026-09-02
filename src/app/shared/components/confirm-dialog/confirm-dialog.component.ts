import { Component, input, output, viewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBan,
  lucideKeyRound,
  lucideLogOut,
  lucideTriangleAlert,
  lucideUndo2,
  lucideX,
} from '@ng-icons/lucide';
import { HlmAlertDialog, HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [HlmAlertDialogImports, HlmButtonImports, NgIcon],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  providers: [
    provideIcons({
      lucideBan,
      lucideKeyRound,
      lucideLogOut,
      lucideTriangleAlert,
      lucideUndo2,
      lucideX,
    }),
  ],
})
export class ConfirmDialogComponent {
  private readonly dialog = viewChild.required<HlmAlertDialog>('dialog');

  title = input.required<string>();
  description = input.required<string>();
  confirmLabel = input('Confirmar');
  cancelLabel = input('Cancelar');
  icon = input('lucideLogOut');

  confirmed = output<void>();

  open(): void {
    this.dialog().open();
  }

  close(): void {
    this.dialog().close();
  }

  onConfirm(): void {
    this.dialog().close();
    this.confirmed.emit();
  }
}
