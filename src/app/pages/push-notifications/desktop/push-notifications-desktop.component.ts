import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBell,
  lucideBellOff,
  lucideCircleAlert,
  lucideCircleCheck,
  lucideInfo,
} from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

@Component({
  selector: 'app-push-notifications-desktop',
  templateUrl: './push-notifications-desktop.component.html',
  styleUrl: './push-notifications-desktop.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIcon, HlmBadgeImports, HlmButtonImports, HlmCardImports, HlmSpinnerImports],
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
export class PushNotificationsDesktopComponent {
  readonly isSubscribed = input(false);
  readonly isLoading = input(false);
  readonly errorMessage = input('');

  readonly toggle = output<void>();
}
