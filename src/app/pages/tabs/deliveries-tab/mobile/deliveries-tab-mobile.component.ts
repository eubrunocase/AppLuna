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
  lucideCircleCheck,
  lucideClock,
  lucideLayoutGrid,
  lucidePackage,
  lucidePackageCheck,
  lucidePlus,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { DeliveryStatus, ResponseDeliveryDTO } from '../../../../core/models';

export type DeliveriesTabStatusFilter = 'ALL' | 'PENDING' | 'DELIVERED';

@Component({
  selector: 'app-deliveries-tab-mobile',
  templateUrl: './deliveries-tab-mobile.component.html',
  styleUrl: './deliveries-tab-mobile.component.scss',
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
    HlmCardImports,
    HlmSkeletonImports,
  ],
  providers: [
    provideIcons({
      lucideBarcode,
      lucideCircleCheck,
      lucideClock,
      lucideLayoutGrid,
      lucidePackage,
      lucidePackageCheck,
      lucidePlus,
    }),
  ],
})
export class DeliveriesTabMobileComponent {
  readonly statusFilters = input<{ value: DeliveriesTabStatusFilter; label: string; icon: string }[]>([]);
  readonly statusFilter = input<DeliveriesTabStatusFilter>('ALL');
  readonly isLoading = input(true);
  readonly skeletonItems = input<number[]>([1, 2, 3]);
  readonly filteredDeliveries = input<ResponseDeliveryDTO[]>([]);
  readonly itemSize = input(132);
  readonly canCreate = input(false);
  readonly photoById = input<Record<string, string>>({});

  readonly refresh = output<{ target: { complete: () => void } }>();
  readonly statusFilterChange = output<DeliveriesTabStatusFilter>();
  readonly create = output<void>();

  readonly trackById = (_: number, item: ResponseDeliveryDTO) => item.id;

  getPhotoUrl(id: string): string | null {
    return this.photoById()[id] ?? null;
  }

  getStatusLabel(status: DeliveryStatus): string {
    return status === DeliveryStatus.DELIVERED ? 'Retirada' : 'Pendente';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR') + ' às ' +
      date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}
