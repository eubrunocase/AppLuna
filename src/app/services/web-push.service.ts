import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { Observable, from, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { PushSubscriptionRequestDTO, PublicKeyResponseDTO } from '../core/models';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({ providedIn: 'root' })
export class WebPushService {
  private http = inject(HttpClient);
  private swPush = inject(SwPush);
  private apiConfig = inject(ApiConfigService);
  private baseUrl = this.apiConfig.API_URL;

  private readonly VAPID_PUBLIC_KEY_URL = `${this.baseUrl}/push/public-key`;
  private readonly SUBSCRIBE_URL = `${this.baseUrl}/push/subscribe`;
  private readonly UNSUBSCRIBE_URL = `${this.baseUrl}/push/unsubscribe`;

  private getPublicKey(): Observable<string> {
    return this.http.get<PublicKeyResponseDTO>(this.VAPID_PUBLIC_KEY_URL).pipe(
      map(response => response.publicKey)
    );
  }

  subscribe(): Observable<boolean> {
    return this.getPublicKey().pipe(
      switchMap(publicKey =>
        from(this.swPush.requestSubscription({
          serverPublicKey: publicKey
        }))
      ),
      switchMap(subscription => {
        const request: PushSubscriptionRequestDTO = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
          }
        };
        return this.http.post(this.SUBSCRIBE_URL, request).pipe(
          map(() => true),
          catchError(() => of(false))
        );
      }),
      catchError(() => of(false))
    );
  }

  unsubscribe(): Observable<boolean> {
    return from(this.swPush.subscription).pipe(
      switchMap(subscription => {
        if (!subscription) {
          return of(true);
        }
        return this.http.post(this.UNSUBSCRIBE_URL, { endpoint: subscription.endpoint }).pipe(
          switchMap(() => from(subscription.unsubscribe())),
          map(() => true),
          catchError(() => of(false))
        );
      })
    );
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
