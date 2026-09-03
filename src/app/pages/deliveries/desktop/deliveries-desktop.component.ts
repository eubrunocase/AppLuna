import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucideClock,
  lucideLayoutGrid,
  lucidePackageCheck,
  lucidePlus,
  lucideRefreshCw,
} from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { DeliveryStatus, ResponseDeliveryDTO } from '../../../core/models';
import type { DeliveriesStatusFilter } from '../mobile/deliveries-mobile.component';

@Component({
  selector: 'app-deliveries-desktop',
  templateUrl: './deliveries-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIcon, HlmBadgeImports, HlmButtonImports, HlmSpinnerImports, HlmTableImports],
  providers: [
    provideIcons({
      lucideCheck,
      lucideClock,
      lucideLayoutGrid,
      lucidePackageCheck,
      lucidePlus,
      lucideRefreshCw,
    }),
  ],
})
export class DeliveriesDesktopComponent {
  readonly statusFilters = input<{ value: DeliveriesStatusFilter; label: string; icon: string }[]>([]);
  readonly statusFilter = input<DeliveriesStatusFilter>('ALL');
  readonly isLoading = input(false);
  readonly filteredDeliveries = input<ResponseDeliveryDTO[]>([]);
  readonly canCreate = input(false);
  readonly canConfirm = input(false);
  readonly userNames = input<Record<string, string>>({});

  readonly statusFilterChange = output<DeliveriesStatusFilter>();
  readonly create = output<void>();
  readonly confirmPickup = output<ResponseDeliveryDTO>();
  readonly refreshList = output<void>();

  getUserName(userId: string): string {
    return this.userNames()[userId] || userId;
  }

  getStatusLabel(status: DeliveryStatus): string {
    return status === DeliveryStatus.DELIVERED ? 'Entregue' : 'Pendente';
  }

  statusVariant(status: DeliveryStatus): 'default' | 'secondary' {
    return status === DeliveryStatus.DELIVERED ? 'default' : 'secondary';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('pt-BR');
  }
}
