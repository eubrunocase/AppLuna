import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';
import { WebSocketService } from './services/websocket.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private authService = inject(AuthService);
  private websocketService = inject(WebSocketService);

  constructor() {
    this.authService.isAuthenticated$.subscribe(authenticated => {
      if (authenticated) {
        this.websocketService.connect();
      } else {
        this.websocketService.disconnect();
      }
    });
  }
}
