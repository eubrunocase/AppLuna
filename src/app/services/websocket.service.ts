import { Injectable, inject } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';
import { AuthService } from './auth.service';
import { TokenStorageService } from '../core/storage/token-storage.service';
import { NotificationDTO } from '../core/models';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private apiConfig = inject(ApiConfigService);
  private authService = inject(AuthService);
  private tokenStorage = inject(TokenStorageService);

  private client: Client | null = null;
  private notificationsSubject = new Subject<NotificationDTO>();

  readonly notifications$: Observable<NotificationDTO> = this.notificationsSubject.asObservable();

  /**
   * Conecta ao broker STOMP (SockJS) e assina o tópico de notificações
   * do usuário autenticado: /topic/notifications/{userId}.
   */
  connect(attemptsLeft = 5): void {
    const token = this.tokenStorage.getAccessToken();
    const user = this.authService.getCurrentUser();

    if (!token || !user?.id) {
      if (attemptsLeft > 0) {
        setTimeout(() => this.connect(attemptsLeft - 1), 1000);
      }
      return;
    }

    if (this.client?.active) {
      return;
    }

    const socketUrl = `${this.wsBaseUrl()}/ws-lunalink?access_token=${encodeURIComponent(token)}`;

    this.client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.client?.subscribe(`/topic/notifications/${user.id}`, (message: IMessage) => {
          this.handleMessage(message);
        });
      },
      onStompError: () => {
        this.disconnect();
      }
    });

    this.client.activate();
  }

  disconnect(): void {
    if (this.client?.active) {
      this.client.deactivate();
    }
    this.client = null;
  }

  private handleMessage(message: IMessage): void {
    try {
      const payload = JSON.parse(message.body) as NotificationDTO;
      this.notificationsSubject.next(payload);
    } catch {
      this.notificationsSubject.next({
        title: 'Notificação',
        message: message.body,
        type: 'UNKNOWN',
        timestamp: new Date().toISOString()
      });
    }
  }

  private wsBaseUrl(): string {
    return this.apiConfig.API_URL.replace(/\/lunaLink\/?$/i, '');
  }
}
