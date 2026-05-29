import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { IonApp, IonRouterOutlet, IonButton, IonIcon } from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss',
  imports: [CommonModule, IonApp, IonRouterOutlet, IonButton, IonIcon],
})
export class AppComponent {
  private authService = inject(AuthService);
  private alertController = inject(AlertController);
  private router = inject(Router);

  readonly isAuthenticated$ = this.authService.isAuthenticated$;

  get isLoginPage(): boolean {
    return this.router.url.startsWith('/login');
  }

  async confirmLogout(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirmar saída',
      message: 'Deseja realmente sair da sua conta?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sair',
          role: 'destructive',
          handler: () => this.authService.logout()
        }
      ]
    });

    await alert.present();
  }
}
