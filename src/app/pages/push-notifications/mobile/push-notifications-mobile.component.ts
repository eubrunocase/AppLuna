import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBell,
  lucideBellOff,
  lucideCircleAlert,
  lucideCircleCheck,
  lucideInfo,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

@Component({
  selector: 'app-push-notifications-mobile',
  templateUrl: './push-notifications-mobile.component.html',
  styleUrl: './push-notifications-mobile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IonContent, NgIcon, HlmButtonImports, HlmCardImports, HlmSpinnerImports],
  providers: [
    provideIcons({
      lucideBell,
      lucideBellOff,
      lucideCircleAlert,
      lucideCircleCheck,
      lucideInfo,
    }),
  ],
})
export class PushNotificationsMobileComponent {
  readonly isSubscribed = input(false);
  readonly isLoading = input(false);
  readonly errorMessage = input('');

  readonly toggle = output<void>();
}
