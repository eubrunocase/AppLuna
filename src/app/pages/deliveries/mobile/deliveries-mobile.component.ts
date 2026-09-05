import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBarcode,
  lucideCheck,
  lucideCircleCheck,
  lucideClock,
  lucideLayoutGrid,
  lucidePackage,
  lucidePackageCheck,
  lucidePlus,
  lucideShieldCheck,
  lucideUser,
  lucideUserCheck,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { DeliveryStatus, ResponseDeliveryDTO } from '../../../core/models';

export type DeliveriesStatusFilter = 'ALL' | 'PENDING' | 'DELIVERED';

@Component({
  selector: 'app-deliveries-mobile',
  templateUrl: './deliveries-mobile.component.html',
  styleUrl: './deliveries-mobile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmSkeletonImports,
  ],
  providers: [
    provideIcons({
      lucideBarcode,
      lucideCheck,
      lucideCircleCheck,
      lucideClock,
      lucideLayoutGrid,
      lucidePackage,
      lucidePackageCheck,
      lucidePlus,
      lucideShieldCheck,
      lucideUser,
      lucideUserCheck,
    }),
  ],
})
export class DeliveriesMobileComponent {
  readonly statusFilters = input<{ value: DeliveriesStatusFilter; label: string; icon: string }[]>([]);
  readonly statusFilter = input<DeliveriesStatusFilter>('ALL');
  readonly isLoading = input(false);
  readonly skeletonItems = input<number[]>([1, 2, 3]);
  readonly filteredDeliveries = input<ResponseDeliveryDTO[]>([]);
  readonly itemSize = input(200);
  readonly canCreate = input(false);
  readonly canConfirm = input(false);
  readonly userNames = input<Record<string, string>>({});

  readonly refresh = output<{ target: { complete: () => void } }>();
  readonly statusFilterChange = output<DeliveriesStatusFilter>();
  readonly create = output<void>();
  readonly confirmPickup = output<ResponseDeliveryDTO>();

  readonly trackById = (_: number, item: ResponseDeliveryDTO) => item.id;

  getUserName(userId: string): string {
    return this.userNames()[userId] || userId;
  }

  getStatusLabel(status: DeliveryStatus): string {
    return status === DeliveryStatus.DELIVERED ? 'Entregue' : 'Pendente';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('pt-BR');
  }
}
