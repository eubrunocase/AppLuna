import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
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
import { DeliveryStatus, ResponseDeliveryDTO } from '../../../../core/models';
import type { DeliveriesTabStatusFilter } from '../mobile/deliveries-tab-mobile.component';

@Component({
  selector: 'app-deliveries-tab-desktop',
  templateUrl: './deliveries-tab-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIcon, HlmBadgeImports, HlmButtonImports, HlmSpinnerImports, HlmTableImports],
  providers: [
    provideIcons({
      lucideClock,
      lucideLayoutGrid,
      lucidePackageCheck,
      lucidePlus,
      lucideRefreshCw,
    }),
  ],
})
export class DeliveriesTabDesktopComponent {
  readonly statusFilters = input<{ value: DeliveriesTabStatusFilter; label: string; icon: string }[]>([]);
  readonly statusFilter = input<DeliveriesTabStatusFilter>('ALL');
  readonly isLoading = input(true);
  readonly filteredDeliveries = input<ResponseDeliveryDTO[]>([]);
  readonly canCreate = input(false);
  readonly photoById = input<Record<string, string>>({});

  readonly statusFilterChange = output<DeliveriesTabStatusFilter>();
  readonly create = output<void>();
  readonly refreshList = output<void>();

  getPhotoUrl(id: string): string | null {
    return this.photoById()[id] ?? null;
  }

  getStatusLabel(status: DeliveryStatus): string {
    return status === DeliveryStatus.DELIVERED ? 'Retirada' : 'Pendente';
  }

  statusVariant(status: DeliveryStatus): 'default' | 'secondary' {
    return status === DeliveryStatus.DELIVERED ? 'default' : 'secondary';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR') + ' às ' +
      date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}
