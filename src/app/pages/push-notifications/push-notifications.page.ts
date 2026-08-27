import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ToastController } from '@ionic/angular';
import { WebPushService } from '../../services/web-push.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-push-notifications',
  template: `
    <app-page-header title="Notificações" [showBack]="true" backHref="/tabs/home" />

    <ion-content class="ion-padding">
      <ion-card class="info-card">
        <ion-card-header>
          <ion-card-title>
            <ion-icon name="notifications-outline" class="title-icon"></ion-icon>
            Push Notifications
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>Receba notificações em tempo real sobre ocorrências e eventos do condomínio.</p>
          <p class="info-text">
            <ion-icon name="information-circle-outline" class="info-inline-icon"></ion-icon>
            Utilizamos Web Push nativo com VAPID - sem Firebase.
          </p>
        </ion-card-content>
      </ion-card>

      <ion-card class="status-card">
        <ion-card-header>
          <ion-card-subtitle>Status da Inscrição</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <div class="status-indicator" [class.active]="isSubscribed">
            <ion-icon [name]="isSubscribed ? 'checkmark-circle' : 'close-circle'"></ion-icon>
            <span>{{ isSubscribed ? 'Inscrito' : 'Não inscrito' }}</span>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-button 
        expand="block" 
        [color]="isSubscribed ? 'danger' : 'primary'"
        (click)="toggleSubscription()"
        [disabled]="isLoading">
        <ion-spinner *ngIf="isLoading" name="crescent"></ion-spinner>
        <ion-icon *ngIf="!isLoading" [name]="isSubscribed ? 'notifications-off-outline' : 'notifications-outline'" slot="start"></ion-icon>
        <span *ngIf="!isLoading">{{ isSubscribed ? 'Desativar Notificações' : 'Ativar Notificações' }}</span>
      </ion-button>

      <div class="error-message" *ngIf="errorMessage">
        <ion-icon name="alert-circle-outline"></ion-icon>
        <span>{{ errorMessage }}</span>
      </div>
    </ion-content>
  `,
  styles: [`
    .info-card {
      border-radius: 12px;
      margin-bottom: 16px;
    }
    
    ion-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
    }
    
    .title-icon {
      color: var(--ion-color-secondary);
      font-size: 24px;
    }
    
    .info-text {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--ion-color-medium);
      margin-top: 12px;
    }
    
    .info-inline-icon {
      color: var(--ion-color-primary);
      font-size: 16px;
      flex-shrink: 0;
    }
    
    .status-card {
      margin-bottom: 24px;
      border-radius: 12px;
    }
    
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      color: var(--ion-color-danger);
    }
    
    .status-indicator.active {
      color: var(--ion-color-success);
    }
    
    .status-indicator ion-icon {
      font-size: 24px;
    }
    
    ion-button {
      margin-bottom: 16px;
    }
    
    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: var(--ion-color-danger-tint);
      border-radius: 8px;
      color: var(--ion-color-danger);
      font-size: 14px;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, PageHeaderComponent]
})
export class PushNotificationsPage {
  private webPushService = inject(WebPushService);
  private toastController = inject(ToastController);

  isSubscribed = false;
  isLoading = false;
  errorMessage = '';

  async toggleSubscription(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    const action = this.isSubscribed 
      ? this.webPushService.unsubscribe()
      : this.webPushService.subscribe();

    action.pipe(
      catchError(error => {
        this.errorMessage = 'Erro ao processar assinatura';
        return of(false);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe(success => {
      if (success) {
        this.isSubscribed = !this.isSubscribed;
        this.showToast(
          this.isSubscribed 
            ? 'Notificações ativadas com sucesso!' 
            : 'Notificações desativadas.'
        );
      } else {
        this.errorMessage = 'Erro ao processar sua solicitação. Verifique se as notificações estão permitidas no navegador.';
      }
    });
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'success'
    });
    await toast.present();
  }
}
