import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-state',
  template: `
    <div class="error-state">
      <ion-icon [name]="icon" class="error-icon"></ion-icon>
      <p class="error-title">{{ title }}</p>
      <p class="error-message">{{ message }}</p>
      <ion-button color="danger" fill="outline" (click)="retry.emit()">
        <ion-icon slot="start" name="refresh-outline"></ion-icon>
        Tentar novamente
      </ion-button>
    </div>
  `,
  styles: [`
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
    }

    .error-icon {
      font-size: 80px;
      color: var(--ion-color-danger);
      margin-bottom: 16px;
      opacity: 0.7;
    }

    .error-title {
      font-size: 18px;
      font-weight: 600;
      color: #fff8f0;
      margin-bottom: 8px;
    }

    .error-message {
      font-size: 14px;
      color: rgba(255, 246, 235, 0.84);
      margin-bottom: 16px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ErrorStateComponent {
  @Input() icon: string = 'alert-circle-outline';
  @Input() title: string = 'Erro ao carregar dados';
  @Input() message: string = 'Verifique sua conexão e tente novamente.';
  @Output() retry = new EventEmitter<void>();
}
