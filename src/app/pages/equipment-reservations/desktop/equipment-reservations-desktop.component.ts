import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBan,
  lucideCircleCheck,
  lucideClock,
  lucideKeyRound,
  lucideLayoutGrid,
  lucidePlay,
  lucidePlus,
  lucideRefreshCw,
  lucideSearch,
  lucideUndo2,
} from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { EquipmentReservationResponseDTO, EquipmentReservationStatus } from '../../../core/models';
import type { EquipmentStatusFilter } from '../mobile/equipment-reservations-mobile.component';

@Component({
  selector: 'app-equipment-reservations-desktop',
  templateUrl: './equipment-reservations-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FormsModule, NgIcon, HlmBadgeImports, HlmButtonImports, HlmInputImports, HlmSpinnerImports, HlmTableImports],
  providers: [
    provideIcons({
      lucideBan,
      lucideCircleCheck,
      lucideClock,
      lucideKeyRound,
      lucideLayoutGrid,
      lucidePlay,
      lucidePlus,
      lucideRefreshCw,
      lucideSearch,
      lucideUndo2,
    }),
  ],
})
export class EquipmentReservationsDesktopComponent {
  readonly statusFilters = input<{ value: EquipmentStatusFilter; label: string; icon: string }[]>([]);
  readonly statusFilter = input<EquipmentStatusFilter>('ALL');
  readonly searchQuery = input('');
  readonly isLoading = input(true);
  readonly filteredReservations = input<EquipmentReservationResponseDTO[]>([]);
  readonly processingId = input<string | null>(null);
  readonly canCreate = input(false);
  readonly canManage = input(false);

  readonly statusFilterChange = output<EquipmentStatusFilter>();
  readonly searchQueryChange = output<string>();
  readonly handover = output<EquipmentReservationResponseDTO>();
  readonly returnItem = output<EquipmentReservationResponseDTO>();
  readonly create = output<void>();
  readonly refreshList = output<void>();

  getStatusLabel(status: string): string {
    if (status === EquipmentReservationStatus.CONFIRMED) return 'Confirmado';
    if (status === EquipmentReservationStatus.IN_USE) return 'Em uso';
    if (status === EquipmentReservationStatus.RETURNED) return 'Devolvido';
    if (status === EquipmentReservationStatus.CANCELED) return 'Cancelado';
    return status;
  }

  statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (status === EquipmentReservationStatus.IN_USE) return 'default';
    if (status === EquipmentReservationStatus.CONFIRMED) return 'secondary';
    if (status === EquipmentReservationStatus.CANCELED) return 'destructive';
    return 'outline';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    }
    return date.toLocaleDateString('pt-BR');
  }
}
