import { Component, inject, OnInit } from '@angular/core';
import { IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideHome,
  lucidePackage,
  lucideTriangleAlert,
} from '@ng-icons/lucide';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrl: './tabs.page.scss',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonLabel, NgIcon],
  providers: [
    provideIcons({
      lucideHome,
      lucideCalendar,
      lucidePackage,
      lucideTriangleAlert,
    }),
  ],
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
