import { Component, inject } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { AppNavigationService } from '../../core/navigation/app-navigation.service';
import { APP_ROUTES } from '../../core/navigation/app-routes';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [IonContent, HlmButtonImports],
  template: `
    <ion-content class="ion-padding shell-page-content">
      <div class="not-found">
        <h1>Página não encontrada</h1>
        <p>A rota que você tentou acessar não existe ou foi movida.</p>
        <button hlmBtn type="button" (click)="goHome()">Voltar ao início</button>
      </div>
    </ion-content>
  `,
  styles: `
    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      min-height: 60vh;
      text-align: center;
    }
    h1 {
      margin: 0;
      font-size: 1.5rem;
    }
    p {
      margin: 0;
      color: #6b5b55;
    }
  `,
})
export class NotFoundPage {
  private navigation = inject(AppNavigationService);

  goHome(): void {
    void this.navigation.resetToHome();
  }
}
