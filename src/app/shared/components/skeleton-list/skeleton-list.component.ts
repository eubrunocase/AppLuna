import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-list',
  template: `
    <div class="skeleton-list">
      <div *ngFor="let item of skeletonItems" class="skeleton-card">
        <ion-skeleton-text animated style="width: 30%; height: 16px;"></ion-skeleton-text>
        <ion-skeleton-text animated style="width: 70%; height: 20px; margin-top: 8px;"></ion-skeleton-text>
        <ion-skeleton-text animated style="width: 50%; height: 14px; margin-top: 8px;"></ion-skeleton-text>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-list {
      padding: 0;
    }

    .skeleton-card {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 12px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class SkeletonListComponent {
  @Input() count: number = 3;

  get skeletonItems(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
