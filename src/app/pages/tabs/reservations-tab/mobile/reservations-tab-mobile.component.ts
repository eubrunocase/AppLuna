import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideBan,
  lucideCheck,
  lucideClock,
  lucideFlame,
  lucideGoal,
  lucideLayoutGrid,
  lucidePartyPopper,
  lucidePlus,
  lucideTriangleAlert,
  lucideTv,
  lucideUser,
  lucideUsers,
  lucideX,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { getSpaceCatalogEntry } from '../../../reservations/space-catalog';

export type ReservationKind = 'space' | 'equipment';
export type TypeFilter = 'ALL' | 'SALAO_FESTAS' | 'CHURRASQUEIRA' | 'CAMPO_FUTEBOL' | 'TELEVISAO';
export type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'IN_USE' | 'RETURNED' | 'CANCELED';

export interface UnifiedReservationView {
  kind: ReservationKind;
  type: string;
  id: string;
  date: string;
  status: string;
  createdAt?: string;
  spaceType?: string;
  user?: { id: string; name: string; email: string };
  equipmentName?: string;
  startTime?: string;
  endTime?: string;
  pickedUpAt?: string | null;
  returnedAt?: string | null;
  canceledAt?: string | null;
}

@Component({
  selector: 'app-reservations-tab-mobile',
  templateUrl: './reservations-tab-mobile.component.html',
  styleUrl: './reservations-tab-mobile.component.scss',
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
    HlmSpinnerImports,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideBan,
      lucideCheck,
      lucideClock,
      lucideFlame,
      lucideGoal,
      lucideLayoutGrid,
      lucidePartyPopper,
      lucidePlus,
      lucideTriangleAlert,
      lucideTv,
      lucideUser,
      lucideUsers,
      lucideX,
    }),
  ],
})
export class ReservationsTabMobileComponent {
  readonly isAdmin = input(false);
  readonly viewMode = input<'mine' | 'all'>('mine');
  readonly pendingApprovalCount = input(0);
  readonly typeFilters = input<{ value: TypeFilter; label: string; icon: string }[]>([]);
  readonly statusFilters = input<{ value: StatusFilter; label: string }[]>([]);
  readonly typeFilter = input<TypeFilter>('ALL');
  readonly statusFilter = input<StatusFilter>('ALL');
  readonly isLoading = input(true);
  readonly skeletonItems = input<number[]>([1, 2, 3, 4]);
  readonly filteredReservations = input<UnifiedReservationView[]>([]);
  readonly itemSize = input(168);
  readonly processingId = input<string | null>(null);

  readonly refresh = output<{ target: { complete: () => void } }>();
  readonly focusPending = output<void>();
  readonly viewModeChange = output<'mine' | 'all'>();
  readonly typeFilterChange = output<TypeFilter>();
  readonly statusFilterChange = output<StatusFilter>();
  readonly approve = output<UnifiedReservationView>();
  readonly reject = output<UnifiedReservationView>();
  readonly cancelSpace = output<UnifiedReservationView>();
  readonly cancelEquipment = output<UnifiedReservationView>();
  readonly create = output<void>();

  readonly trackById = (_: number, item: UnifiedReservationView) => `${item.kind}-${item.id}`;

  getSpaceImage(reservation: UnifiedReservationView): string | null {
    if (reservation.kind === 'equipment') {
      return getSpaceCatalogEntry('TELEVISAO')?.imageSrc ?? null;
    }
    return getSpaceCatalogEntry(reservation.spaceType)?.imageSrc ?? null;
  }

  getReservationTitle(reservation: UnifiedReservationView): string {
    if (reservation.kind === 'equipment') {
      return getSpaceCatalogEntry('TELEVISAO')?.name || reservation.equipmentName || 'Televisão';
    }
    return getSpaceCatalogEntry(reservation.spaceType)?.name || reservation.spaceType || '';
  }

  isPendingHighlight(reservation: UnifiedReservationView): boolean {
    return reservation.kind === 'space'
      && this.isAdmin()
      && this.viewMode() === 'all'
      && reservation.status === 'PENDING';
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

  getDay(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).getDate().toString();
  }

  getMonth(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
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

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('pt-BR');
  }
}
