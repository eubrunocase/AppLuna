import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBan,
  lucideBuilding2,
  lucideCalendar,
  lucideCircleCheck,
  lucideClock,
  lucideKeyRound,
  lucideLayoutGrid,
  lucidePlay,
  lucidePlus,
  lucideSearch,
  lucideTv,
  lucideUndo2,
  lucideUser,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { EquipmentReservationResponseDTO, EquipmentReservationStatus } from '../../../core/models';

export type EquipmentStatusFilter = 'ALL' | EquipmentReservationStatus;

@Component({
  selector: 'app-equipment-reservations-mobile',
  templateUrl: './equipment-reservations-mobile.component.html',
  styleUrl: './equipment-reservations-mobile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    FormsModule,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmInputImports,
    HlmSkeletonImports,
    HlmSpinnerImports,
  ],
  providers: [
    provideIcons({
      lucideBan,
      lucideBuilding2,
      lucideCalendar,
      lucideCircleCheck,
      lucideClock,
      lucideKeyRound,
      lucideLayoutGrid,
      lucidePlay,
      lucidePlus,
      lucideSearch,
      lucideTv,
      lucideUndo2,
      lucideUser,
    }),
  ],
})
export class EquipmentReservationsMobileComponent {
  readonly statusFilters = input<{ value: EquipmentStatusFilter; label: string; icon: string }[]>([]);
  readonly statusFilter = input<EquipmentStatusFilter>('ALL');
  readonly searchQuery = input('');
  readonly isLoading = input(true);
  readonly skeletonItems = input<number[]>([1, 2, 3]);
  readonly filteredReservations = input<EquipmentReservationResponseDTO[]>([]);
  readonly itemSize = input(188);
  readonly processingId = input<string | null>(null);
  readonly canCreate = input(false);
  readonly canManage = input(false);

  readonly refresh = output<{ target: { complete: () => void } }>();
  readonly statusFilterChange = output<EquipmentStatusFilter>();
  readonly searchQueryChange = output<string>();
  readonly handover = output<EquipmentReservationResponseDTO>();
  readonly returnItem = output<EquipmentReservationResponseDTO>();
  readonly create = output<void>();

  readonly trackById = (_: number, item: EquipmentReservationResponseDTO) => item.id;

  getStatusLabel(status: string): string {
    if (status === EquipmentReservationStatus.CONFIRMED) return 'Confirmado';
    if (status === EquipmentReservationStatus.IN_USE) return 'Em uso';
    if (status === EquipmentReservationStatus.RETURNED) return 'Devolvido';
    if (status === EquipmentReservationStatus.CANCELED) return 'Cancelado';
    return status;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    }
    return date.toLocaleDateString('pt-BR');
  }

  formatDateTime(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
