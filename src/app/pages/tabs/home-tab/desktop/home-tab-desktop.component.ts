import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideClipboardList,
  lucideInfo,
  lucidePackage,
} from '@ng-icons/lucide';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

@Component({
  selector: 'app-home-tab-desktop',
  templateUrl: './home-tab-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIcon, HlmSkeletonImports],
  providers: [
    provideIcons({
      lucideClipboardList,
      lucidePackage,
      lucideCalendar,
      lucideInfo,
    }),
  ],
})
export class HomeTabDesktopComponent {
  readonly isAdmin = input(false);
  readonly canSeeReservationsSummary = input(false);
  readonly isLoadingStats = input(true);
  readonly pendingApprovals = input(0);
  readonly pendingDeliveries = input(0);
  readonly activeReservations = input(0);
  readonly statSkeletonItems = input<number[]>([]);

  readonly pendingApprovalsClick = output<void>();
  readonly deliveriesClick = output<void>();
  readonly reservationsClick = output<void>();
}
