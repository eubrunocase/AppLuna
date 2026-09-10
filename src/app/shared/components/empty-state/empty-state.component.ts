import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-state">
      <ion-icon [name]="icon" class="empty-icon"></ion-icon>
      <p class="empty-title">{{ title }}</p>
      <p class="empty-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
    }

    .empty-icon {
      font-size: 80px;
      color: var(--ion-color-tertiary);
      margin-bottom: 16px;
      opacity: 0.7;
    }

    .empty-title {
      font-size: 18px;
      font-weight: 600;
      color: #fff8f0;
      margin-bottom: 8px;
    }

    .empty-message {
      font-size: 14px;
      color: rgba(255, 246, 235, 0.84);
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class EmptyStateComponent {
  @Input() icon: string = 'calendar-outline';
  @Input() title: string = 'Nenhum item encontrado';
  @Input() message: string = '';
}
