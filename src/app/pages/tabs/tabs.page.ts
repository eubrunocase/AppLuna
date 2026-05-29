import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-tabs',
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Início</ion-label>
        </ion-tab-button>

        <ion-tab-button *ngIf="canSeeReservations" tab="reservations" href="/tabs/reservations">
          <ion-icon name="calendar-outline"></ion-icon>
          <ion-label>Reservas</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="deliveries" href="/tabs/deliveries">
          <ion-icon name="cube-outline"></ion-icon>
          <ion-label>Entregas</ion-label>
        </ion-tab-button>

        <ion-tab-button *ngIf="canSeeOccurrences" tab="occurrences" href="/tabs/occurrences">
          <ion-icon name="alert-circle-outline"></ion-icon>
          <ion-label>Ocorrências</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule]
})
export class TabsPage implements OnInit {
  private authService = inject(AuthService);

  canSeeReservations = false;
  canSeeOccurrences = false;

  ngOnInit(): void {
    this.canSeeReservations = this.authService.isAdmin() || this.authService.isResident();
    this.canSeeOccurrences = this.authService.isAdmin() || this.authService.isResident();
  }
}
