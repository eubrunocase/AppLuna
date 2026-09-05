import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideClipboardList,
  lucideInfo,
  lucidePackage,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

export interface HomeQuickActionView {
  id: string;
  label: string;
  iconSrc: string;
}

@Component({
  selector: 'app-home-tab-mobile',
  templateUrl: './home-tab-mobile.component.html',
  styleUrl: './home-tab-mobile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IonContent, NgIcon, HlmCardImports, HlmSkeletonImports],
  providers: [
    provideIcons({
      lucideClipboardList,
      lucidePackage,
      lucideCalendar,
      lucideInfo,
    }),
  ],
})
export class HomeTabMobileComponent {
  readonly isAdmin = input(false);
  readonly canSeeReservationsSummary = input(false);
  readonly isLoadingStats = input(true);
  readonly pendingApprovals = input(0);
  readonly pendingDeliveries = input(0);
  readonly activeReservations = input(0);
  readonly statColumns = input(1);
  readonly statSkeletonItems = input<number[]>([]);
  readonly quickActions = input<HomeQuickActionView[]>([]);

  readonly contentScroll = output<CustomEvent>();
  readonly pendingApprovalsClick = output<void>();
  readonly deliveriesClick = output<void>();
  readonly reservationsClick = output<void>();
  readonly quickAction = output<string>();
}
