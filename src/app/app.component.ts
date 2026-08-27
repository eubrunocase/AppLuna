import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';
import { WebSocketService } from './services/websocket.service';
import { UiService } from './shared/services/ui.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private authService = inject(AuthService);
  private websocketService = inject(WebSocketService);
  private uiService = inject(UiService);

  constructor() {
    this.authService.isAuthenticated$.subscribe(authenticated => {
      if (authenticated) {
        this.websocketService.connect();
      } else {
        this.websocketService.disconnect();
      }
    });

    this.websocketService.notifications$.subscribe(notification => {
      this.uiService.showToast(notification.message, 'warning', 6000);
    });
  }
}
