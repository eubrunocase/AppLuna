import { Component, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { ViewWillEnter } from '@ionic/angular/standalone';
import { WebPushService } from '../../services/web-push.service';
import { AppShellService } from '../../core/shell/app-shell.service';
import { LayoutService } from '../../core/layout/layout.service';
import { PushNotificationsDesktopComponent } from './desktop/push-notifications-desktop.component';
import { PushNotificationsMobileComponent } from './mobile/push-notifications-mobile.component';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-push-notifications',
  templateUrl: './push-notifications.page.html',
  standalone: true,
  imports: [PushNotificationsDesktopComponent, PushNotificationsMobileComponent],
})
export class PushNotificationsPage implements ViewWillEnter {
  private webPushService = inject(WebPushService);
  private toastController = inject(ToastController);
  private shell = inject(AppShellService);
  readonly layout = inject(LayoutService);

  isSubscribed = false;
  isLoading = false;
  errorMessage = '';

  ionViewWillEnter(): void {
    this.shell.configure({
      title: 'Notificações',
      showBack: true,
      showLogo: false,
      showLogout: false,
      headerState: 'compact',
    });
    this.shell.setExpandContent(null);
  }

  async toggleSubscription(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    const action = this.isSubscribed
      ? this.webPushService.unsubscribe()
      : this.webPushService.subscribe();

    action.pipe(
      catchError(() => {
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
