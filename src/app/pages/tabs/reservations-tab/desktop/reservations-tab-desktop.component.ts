import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBan,
  lucideCheck,
  lucideFlame,
  lucideGoal,
  lucideLayoutGrid,
  lucidePartyPopper,
  lucidePlus,
  lucideRefreshCw,
  lucideTv,
  lucideUser,
  lucideUsers,
  lucideX,
} from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { getSpaceCatalogEntry } from '../../../reservations/space-catalog';
import type {
  StatusFilter,
  TypeFilter,
  UnifiedReservationView,
} from '../mobile/reservations-tab-mobile.component';

@Component({
  selector: 'app-reservations-tab-desktop',
  templateUrl: './reservations-tab-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIcon, HlmBadgeImports, HlmButtonImports, HlmSpinnerImports, HlmTableImports],
  providers: [
    provideIcons({
      lucideBan,
      lucideCheck,
      lucideFlame,
      lucideGoal,
      lucideLayoutGrid,
      lucidePartyPopper,
      lucidePlus,
      lucideRefreshCw,
      lucideTv,
      lucideUser,
      lucideUsers,
      lucideX,
    }),
  ],
})
export class ReservationsTabDesktopComponent {
  readonly isAdmin = input(false);
  readonly viewMode = input<'mine' | 'all'>('mine');
  readonly pendingApprovalCount = input(0);
  readonly typeFilters = input<{ value: TypeFilter; label: string; icon: string }[]>([]);
  readonly statusFilters = input<{ value: StatusFilter; label: string }[]>([]);
  readonly typeFilter = input<TypeFilter>('ALL');
  readonly statusFilter = input<StatusFilter>('ALL');
  readonly isLoading = input(true);
  readonly filteredReservations = input<UnifiedReservationView[]>([]);
  readonly processingId = input<string | null>(null);

  readonly focusPending = output<void>();
  readonly viewModeChange = output<'mine' | 'all'>();
  readonly typeFilterChange = output<TypeFilter>();
  readonly statusFilterChange = output<StatusFilter>();
  readonly approve = output<UnifiedReservationView>();
  readonly reject = output<UnifiedReservationView>();
  readonly cancelSpace = output<UnifiedReservationView>();
  readonly cancelEquipment = output<UnifiedReservationView>();
  readonly create = output<void>();
  readonly refreshList = output<void>();

  getReservationTitle(reservation: UnifiedReservationView): string {
    if (reservation.kind === 'equipment') {
      return getSpaceCatalogEntry('TELEVISAO')?.name || reservation.equipmentName || 'Televisão';
    }
    return getSpaceCatalogEntry(reservation.spaceType)?.name || reservation.spaceType || '';
  }

  canApprove(reservation: UnifiedReservationView): boolean {
    return reservation.kind === 'space'
      && this.isAdmin()
      && this.viewMode() === 'all'
      && reservation.status === 'PENDING';
  }

  canCancelApprovedSpace(reservation: UnifiedReservationView): boolean {
    return reservation.kind === 'space'
      && this.isAdmin()
      && this.viewMode() === 'all'
      && reservation.status === 'APPROVED';
  }

  canCancelEquipment(reservation: UnifiedReservationView): boolean {
    return reservation.kind === 'equipment' && reservation.status === 'CONFIRMED';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendente',
      APPROVED: 'Aprovada',
      REJECTED: 'Rejeitada',
      CANCELLED: 'Cancelada',
      CONFIRMED: 'Confirmado',
      IN_USE: 'Em Uso',
      RETURNED: 'Devolvido',
      CANCELED: 'Cancelado',
    };
    return labels[status] || status;
  }

  statusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (status === 'PENDING' || status === 'CONFIRMED') return 'secondary';
    if (status === 'APPROVED' || status === 'RETURNED') return 'default';
    if (status === 'REJECTED' || status === 'CANCELED' || status === 'CANCELLED') return 'destructive';
    return 'outline';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }
}
