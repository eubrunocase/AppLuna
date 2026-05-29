import { Injectable } from '@angular/core';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Observable, from } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UiService {
  private loading: HTMLIonLoadingElement | null = null;

  constructor(
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async showLoading(message = 'Aguarde...'): Promise<void> {
    if (this.loading) {
      await this.loading.dismiss();
    }
    
    this.loading = await this.loadingController.create({
      message,
      spinner: 'crescent',
      cssClass: 'custom-loading',
      duration: 0,
      backdropDismiss: false
    });
    
    await this.loading.present();
  }

  async hideLoading(): Promise<void> {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }

  async showToast(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration = 3000
  ): Promise<void> {
    const color = type === 'success' ? 'success' : 
                  type === 'error' ? 'danger' : 
                  type === 'warning' ? 'warning' : 'primary';
    
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'top',
      color,
      cssClass: `toast-${type}`,
      buttons: [
        {
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    
    await toast.present();
  }

  async showSuccess(message: string, duration = 3000): Promise<void> {
    await this.showToast(message, 'success', duration);
  }

  async showError(message: string, duration = 4000): Promise<void> {
    await this.showToast(message, 'error', duration);
  }

  async showWarning(message: string, duration = 3000): Promise<void> {
    await this.showToast(message, 'warning', duration);
  }

  async showAlert(options: {
    header: string;
    message?: string;
    inputs?: any[];
    buttons: any[];
  }): Promise<HTMLIonAlertElement> {
    const alert = await this.alertController.create(options);
    await alert.present();
    return alert;
  }

  async showConfirm(
    header: string,
    message: string,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header,
        message,
        buttons: [
          {
            text: cancelText,
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: confirmText,
            handler: () => resolve(true)
          }
        ]
      });
      await alert.present();
    });
  }

  async showInputAlert(options: {
    header: string;
    message?: string;
    inputs: any[];
    confirmText?: string;
  }): Promise<any> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: options.header,
        message: options.message,
        inputs: options.inputs,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(null)
          },
          {
            text: options.confirmText || 'Confirmar',
            handler: (data) => resolve(data)
          }
        ]
      });
      await alert.present();
    });
  }
}
