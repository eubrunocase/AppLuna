import { ChangeDetectorRef, Component, inject, OnInit, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  ViewWillEnter,
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
import { catchError, EMPTY, finalize, of } from 'rxjs';
import { EquipmentReservationResponseDTO, EquipmentReservationStatus, UserRoles } from '../../core/models';
import { AppNavigationService } from '../../core/navigation/app-navigation.service';
import { APP_ROUTES } from '../../core/navigation/app-routes';
import { AppShellService } from '../../core/shell/app-shell.service';
import { AuthService } from '../../services/auth.service';
import { EquipmentReservationService } from '../../services/equipment-reservation.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { UiService } from '../../shared/services/ui.service';

type StatusFilter = 'ALL' | EquipmentReservationStatus;

@Component({
  selector: 'app-equipment-reservations',
  templateUrl: './equipment-reservations.page.html',
  styleUrl: './equipment-reservations.page.scss',
  standalone: true,
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    FormsModule,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmInputImports,
    HlmSkeletonImports,
    HlmSpinnerImports,
    ConfirmDialogComponent,
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
export class EquipmentReservationsPage implements OnInit, ViewWillEnter {
  private equipmentService = inject(EquipmentReservationService);
  private authService = inject(AuthService);
  private navigation = inject(AppNavigationService);
  private shell = inject(AppShellService);
  private uiService = inject(UiService);
  private cdr = inject(ChangeDetectorRef);

  private readonly confirmDialog = viewChild.required<ConfirmDialogComponent>('confirmDialog');

  reservations: EquipmentReservationResponseDTO[] = [];
  filteredReservations: EquipmentReservationResponseDTO[] = [];
  isLoading = true;
  statusFilter: StatusFilter = 'ALL';
  searchQuery = '';
  processingId: string | null = null;
  canCreate = false;
  canManage = false;

  confirmTitle = 'Confirmar ação';
  confirmDescription = '';
  confirmLabel = 'Confirmar';
  confirmIcon = 'lucideKeyRound';
  private pendingAction: { type: 'handover' | 'return'; reservation: EquipmentReservationResponseDTO } | null = null;

  readonly skeletonItems = [1, 2, 3];

  readonly statusFilters: { value: StatusFilter; label: string; icon: string }[] = [
    { value: 'ALL', label: 'Todos', icon: 'lucideLayoutGrid' },
    { value: EquipmentReservationStatus.CONFIRMED, label: 'Confirmados', icon: 'lucideClock' },
    { value: EquipmentReservationStatus.IN_USE, label: 'Em uso', icon: 'lucidePlay' },
    { value: EquipmentReservationStatus.RETURNED, label: 'Devolvidos', icon: 'lucideCircleCheck' },
    { value: EquipmentReservationStatus.CANCELED, label: 'Cancelados', icon: 'lucideBan' },
  ];

  ngOnInit(): void {
    const role = this.authService.getCurrentUser()?.role;
    this.canManage = this.authService.isAdmin() || this.authService.isEmployee();
    this.canCreate = role === UserRoles.ADMIN_ROLE;
    this.loadReservations();
  }

  ionViewWillEnter(): void {
    this.loadReservations();
    this.shell.configure({
      title: 'Equipamentos',
      subtitle: 'Controle da TV comunitária',
      showBack: true,
      showLogo: false,
      showLogout: false,
      headerState: 'compact',
      progressStep: null,
      progressTotal: null,
    });
    this.shell.setExpandContent(null);
  }

  loadReservations(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.equipmentService.list().pipe(
      catchError(() => {
        void this.uiService.showError('Erro ao carregar empréstimos');
        return of([] as EquipmentReservationResponseDTO[]);
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }),
    ).subscribe(reservations => {
      this.reservations = this.sortReservations(reservations);
      this.applyFilters();
    });
  }

  refresh(event: { target: { complete: () => void } }): void {
    this.loadReservations();
    setTimeout(() => event.target.complete(), 1000);
  }

  setStatusFilter(value: StatusFilter): void {
    this.statusFilter = value;
    this.applyFilters();
  }

  setSearchQuery(value: string): void {
    this.searchQuery = value;
    this.applyFilters();
  }

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

  openCreate(): void {
    void this.navigation.push(APP_ROUTES.homeTvNew);
  }

  askHandover(reservation: EquipmentReservationResponseDTO): void {
    if (!this.canManage || this.processingId) {
      return;
    }
    this.pendingAction = { type: 'handover', reservation };
    this.confirmTitle = 'Entregar controle';
    this.confirmDescription = `Entregar o controle da TV para ${reservation.userName} (apto ${reservation.userApartment})?`;
    this.confirmLabel = 'Entregar';
    this.confirmIcon = 'lucideKeyRound';
    this.cdr.detectChanges();
    this.confirmDialog().open();
  }

  askReturn(reservation: EquipmentReservationResponseDTO): void {
    if (!this.canManage || this.processingId) {
      return;
    }
    this.pendingAction = { type: 'return', reservation };
    this.confirmTitle = 'Confirmar devolução';
    this.confirmDescription = `Registrar a devolução do controle por ${reservation.userName}? A reserva será encerrada.`;
    this.confirmLabel = 'Devolver';
    this.confirmIcon = 'lucideUndo2';
    this.cdr.detectChanges();
    this.confirmDialog().open();
  }

  confirmAction(): void {
    const pending = this.pendingAction;
    this.pendingAction = null;
    if (!pending) {
      return;
    }

    this.processingId = pending.reservation.id;
    const request$ = pending.type === 'handover'
      ? this.equipmentService.handover(pending.reservation.id)
      : this.equipmentService.returnItem(pending.reservation.id);

    request$.pipe(
      catchError(() => {
        void this.uiService.showError(
          pending.type === 'handover' ? 'Erro ao entregar o controle' : 'Erro ao registrar a devolução',
        );
        return EMPTY;
      }),
      finalize(() => {
        this.processingId = null;
        this.cdr.markForCheck();
      }),
    ).subscribe(async () => {
      await this.uiService.showSuccess(
        pending.type === 'handover' ? 'Controle entregue' : 'Devolução registrada',
      );
      this.loadReservations();
    });
  }

  private sortReservations(items: EquipmentReservationResponseDTO[]): EquipmentReservationResponseDTO[] {
    const rank: Record<string, number> = {
      [EquipmentReservationStatus.IN_USE]: 0,
      [EquipmentReservationStatus.CONFIRMED]: 1,
      [EquipmentReservationStatus.RETURNED]: 2,
      [EquipmentReservationStatus.CANCELED]: 3,
    };

    return [...items].sort((a, b) => {
      const byStatus = (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
      if (byStatus !== 0) return byStatus;
      return `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`);
    });
  }

  private applyFilters(): void {
    const query = this.searchQuery.trim().toLowerCase();

    this.filteredReservations = this.reservations.filter(item => {
      const matchesStatus = this.statusFilter === 'ALL' || item.status === this.statusFilter;
      if (!matchesStatus) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [item.userName, item.userApartment, item.equipmentName].some(value =>
        (value ?? '').toLowerCase().includes(query),
      );
    });
  }
}
