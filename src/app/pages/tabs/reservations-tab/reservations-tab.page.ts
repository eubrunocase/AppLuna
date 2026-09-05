import { ChangeDetectorRef, Component, inject, viewChild } from '@angular/core';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
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
import { ReservationService } from '../../../services/reservation.service';
import { EquipmentReservationService } from '../../../services/equipment-reservation.service';
import { ReservationResponseDTO, EquipmentReservationResponseDTO, ReservationStatus } from '../../../core/models';
import { AuthService } from '../../../services/auth.service';
import { UiService } from '../../../shared/services/ui.service';
import { AppNavigationService } from '../../../core/navigation/app-navigation.service';
import { APP_ROUTES } from '../../../core/navigation/app-routes';
import { AppShellService } from '../../../core/shell/app-shell.service';
import { ReservationDraftService } from '../../reservations/reservation-draft.service';
import { getSpaceCatalogEntry } from '../../reservations/space-catalog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LunaItemListComponent } from '../../../shared/components/luna-item-list/luna-item-list.component';
import { catchError, finalize, forkJoin, of } from 'rxjs';

type ReservationKind = 'space' | 'equipment';

type TypeFilter = 'ALL' | 'SALAO_FESTAS' | 'CHURRASQUEIRA' | 'CAMPO_FUTEBOL' | 'TELEVISAO';
type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'IN_USE' | 'RETURNED' | 'CANCELED';

interface UnifiedReservation {
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
  selector: 'app-reservations-tab',
  templateUrl: './reservations-tab.page.html',
  styleUrl: './reservations-tab.page.scss',
  standalone: true,
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmSkeletonImports,
    HlmSpinnerImports,
    ConfirmDialogComponent,
    LunaItemListComponent,
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
export class ReservationsTabPage implements ViewWillEnter {
  private reservationService = inject(ReservationService);
  private equipmentService = inject(EquipmentReservationService);
  private authService = inject(AuthService);
  private navigation = inject(AppNavigationService);
  private route = inject(ActivatedRoute);
  private shell = inject(AppShellService);
  private draft = inject(ReservationDraftService);
  private uiService = inject(UiService);
  private cdr = inject(ChangeDetectorRef);

  reservations: ReservationResponseDTO[] = [];
  equipmentReservations: EquipmentReservationResponseDTO[] = [];
  allReservations: UnifiedReservation[] = [];
  filteredReservations: UnifiedReservation[] = [];
  isLoading = true;
  isAdmin = false;
  viewMode: 'mine' | 'all' = 'mine';
  typeFilter: TypeFilter = 'ALL';
  statusFilter: StatusFilter = 'ALL';
  processingId: string | null = null;
  pendingApprovalCount = 0;
  confirmTitle = '';
  confirmDescription = '';
  confirmLabel = 'Confirmar';
  confirmIcon = 'lucideLogOut';
  private pendingAction: {
    kind: 'reject' | 'cancel-space' | 'cancel-equipment';
    reservation: UnifiedReservation;
  } | null = null;
  private readonly confirmDialog = viewChild.required<ConfirmDialogComponent>('confirmDialog');

  readonly skeletonItems = [1, 2, 3, 4];

  readonly typeFilters: { value: TypeFilter; label: string; icon: string }[] = [
    { value: 'ALL', label: 'Todas', icon: 'lucideLayoutGrid' },
    { value: 'SALAO_FESTAS', label: 'Salão', icon: 'lucidePartyPopper' },
    { value: 'CHURRASQUEIRA', label: 'Churrasqueira', icon: 'lucideFlame' },
    { value: 'CAMPO_FUTEBOL', label: 'Campo', icon: 'lucideGoal' },
    { value: 'TELEVISAO', label: 'TV', icon: 'lucideTv' },
  ];

  get statusFilters(): { value: StatusFilter; label: string }[] {
    if (this.isEquipmentFilter) {
      return [
        { value: 'ALL', label: 'Todas' },
        { value: 'CONFIRMED', label: 'Confirmadas' },
        { value: 'IN_USE', label: 'Em uso' },
        { value: 'RETURNED', label: 'Devolvidas' },
        { value: 'CANCELED', label: 'Canceladas' },
      ];
    }

    return [
      { value: 'ALL', label: 'Todas' },
      { value: 'PENDING', label: 'Pendentes' },
      { value: 'APPROVED', label: 'Aprovadas' },
    ];
  }

  get isEquipmentFilter(): boolean {
    return this.typeFilter === 'TELEVISAO';
  }

  ionViewWillEnter(): void {
    this.isAdmin = this.authService.isAdmin();
    this.applyQueryParams();
    this.loadReservations();
    this.shell.configure({
      title: this.isAdmin && this.viewMode === 'all' ? 'Reservas do Condomínio' : 'Minhas Reservas',
      subtitle: '',
      showBack: false,
      showLogo: true,
      showLogout: true,
      headerState: 'compact',
      progressStep: null,
      progressTotal: null,
    });
    this.shell.setExpandContent(null);
  }

  private applyQueryParams(): void {
    const params = this.route.snapshot.queryParamMap;
    if (this.isAdmin && params.get('view') === 'all') {
      this.viewMode = 'all';
    }
    const type = params.get('type')?.toUpperCase();
    if (
      type === 'TELEVISAO'
      || type === 'SALAO_FESTAS'
      || type === 'CHURRASQUEIRA'
      || type === 'CAMPO_FUTEBOL'
    ) {
      this.typeFilter = type as TypeFilter;
      this.statusFilter = 'ALL';
    }
    const status = params.get('status');
    if (status === 'PENDING' || status === 'APPROVED' || status === 'ALL') {
      this.statusFilter = status as StatusFilter;
    }
  }

  loadReservations(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.stopLoading();
      return;
    }

    const isAllMode = this.isAdmin && this.viewMode === 'all';
    // Admin: um único getAll — evita segundo request só para badge PENDING
    const spaces$ = (this.isAdmin
      ? this.reservationService.getAll()
      : this.reservationService.getByUser(currentUser.id)
    ).pipe(catchError(() => of([] as ReservationResponseDTO[])));
    const equipment$ = (isAllMode
      ? this.equipmentService.list()
      : this.equipmentService.listMine()
    ).pipe(catchError(() => of([] as EquipmentReservationResponseDTO[])));

    forkJoin([spaces$, equipment$]).pipe(
      finalize(() => this.stopLoading())
    ).subscribe(([spaces, equipment]) => {
      if (this.isAdmin) {
        this.pendingApprovalCount = spaces.filter(r => r.status === ReservationStatus.PENDING).length;
      } else {
        this.pendingApprovalCount = 0;
      }

      const displaySpaces = this.isAdmin && !isAllMode
        ? spaces.filter(r => r.user?.id === currentUser.id)
        : spaces;

      this.reservations = displaySpaces;
      this.equipmentReservations = equipment;
      this.allReservations = this.mergeReservations(displaySpaces, equipment);
      this.filterByStatus();
    });
  }

  private stopLoading(): void {
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  private mergeReservations(spaces: ReservationResponseDTO[], equipment: EquipmentReservationResponseDTO[]): UnifiedReservation[] {
    const spaceItems: UnifiedReservation[] = spaces.map(r => ({
      kind: 'space',
      type: String(r.space.type),
      id: r.id,
      date: r.date,
      status: String(r.status),
      createdAt: r.createdAt,
      spaceType: String(r.space.type),
      user: r.user
    }));

    const equipmentItems: UnifiedReservation[] = equipment.map(r => ({
      kind: 'equipment',
      type: 'TELEVISAO',
      id: r.id,
      date: r.date,
      status: String(r.status),
      createdAt: r.createdAt,
      equipmentName: r.equipmentName,
      startTime: r.startTime,
      endTime: r.endTime,
      pickedUpAt: r.pickedUpAt,
      returnedAt: r.returnedAt,
      canceledAt: r.canceledAt
    }));

    return [...spaceItems, ...equipmentItems]
      .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  }

  setTypeFilter(value: TypeFilter): void {
    this.typeFilter = value;
    this.statusFilter = 'ALL';
    this.filterByStatus();
  }

  setStatusFilter(value: StatusFilter): void {
    this.statusFilter = value;
    this.filterByStatus();
  }

  setViewMode(mode: 'mine' | 'all'): void {
    if (this.viewMode === mode) return;
    this.viewMode = mode;
    this.shell.configure({
      title: this.isAdmin && this.viewMode === 'all' ? 'Reservas do Condomínio' : 'Minhas Reservas',
      subtitle: '',
      showBack: false,
      showLogo: true,
      showLogout: true,
      headerState: 'compact',
      progressStep: null,
      progressTotal: null,
    });
    this.loadReservations();
  }

  refresh(event: { target: { complete: () => void } }): void {
    this.loadReservations();
    setTimeout(() => event.target.complete(), 1000);
  }

  filterByStatus(): void {
    this.filteredReservations = this.allReservations.filter(r => {
      const typeOk = this.typeFilter === 'ALL' || r.type === this.typeFilter;
      const statusOk = this.statusFilter === 'ALL' || r.status === this.statusFilter;
      return typeOk && statusOk;
    });
  }

  focusPending(): void {
    this.typeFilter = 'ALL';
    this.statusFilter = 'PENDING';
    if (this.viewMode !== 'all') {
      this.setViewMode('all');
      return;
    }
    this.filterByStatus();
    this.cdr.markForCheck();
  }

  getSpaceImage(reservation: UnifiedReservation): string | null {
    if (reservation.kind === 'equipment') {
      return getSpaceCatalogEntry('TELEVISAO')?.imageSrc ?? null;
    }
    return getSpaceCatalogEntry(reservation.spaceType)?.imageSrc ?? null;
  }

  getReservationTitle(reservation: UnifiedReservation): string {
    if (reservation.kind === 'equipment') {
      return getSpaceCatalogEntry('TELEVISAO')?.name || reservation.equipmentName || 'Televisão';
    }
    return getSpaceCatalogEntry(reservation.spaceType)?.name || this.getSpaceTypeLabel(reservation.spaceType!);
  }

  isPendingHighlight(reservation: UnifiedReservation): boolean {
    return reservation.kind === 'space'
      && this.isAdmin
      && this.viewMode === 'all'
      && reservation.status === 'PENDING';
  }

  canApprove(reservation: UnifiedReservation): boolean {
    return reservation.kind === 'space'
      && this.isAdmin
      && this.viewMode === 'all'
      && reservation.status === 'PENDING';
  }

  canCancelApprovedSpace(reservation: UnifiedReservation): boolean {
    return reservation.kind === 'space'
      && this.isAdmin
      && this.viewMode === 'all'
      && reservation.status === 'APPROVED';
  }

  canCancelEquipment(reservation: UnifiedReservation): boolean {
    return reservation.kind === 'equipment' && reservation.status === 'CONFIRMED';
  }

  approveReservation(reservation: UnifiedReservation): void {
    if (this.processingId) return;
    this.processingId = reservation.id;
    this.reservationService.approve(reservation.id).pipe(
      catchError(error => {
        this.uiService.showError(error?.message || 'Não foi possível aprovar a reserva.');
        return of(null);
      }),
      finalize(() => this.processingId = null)
    ).subscribe(updated => {
      if (updated) {
        this.loadReservations();
        this.uiService.showSuccess(`Reserva de ${updated.user.name} aprovada.`);
      }
    });
  }

  private openConfirm(config: {
    kind: 'reject' | 'cancel-space' | 'cancel-equipment';
    reservation: UnifiedReservation;
    title: string;
    description: string;
    confirmLabel: string;
    icon: string;
  }): void {
    if (this.processingId) return;
    this.pendingAction = { kind: config.kind, reservation: config.reservation };
    this.confirmTitle = config.title;
    this.confirmDescription = config.description;
    this.confirmLabel = config.confirmLabel;
    this.confirmIcon = config.icon;
    this.cdr.detectChanges();
    this.confirmDialog().open();
  }

  rejectReservation(reservation: UnifiedReservation): void {
    this.openConfirm({
      kind: 'reject',
      reservation,
      title: 'Rejeitar reserva',
      description: `Confirma a rejeição da reserva de ${reservation.user?.name} em ${this.formatDate(reservation.date)} (${this.getSpaceTypeLabel(reservation.spaceType!)})?`,
      confirmLabel: 'Rejeitar',
      icon: 'lucideX',
    });
  }

  confirmDialogAction(): void {
    const action = this.pendingAction;
    this.pendingAction = null;
    if (!action) return;

    if (action.kind === 'reject') {
      this.doReject(action.reservation);
      return;
    }
    if (action.kind === 'cancel-space') {
      this.doCancelSpace(action.reservation);
      return;
    }
    this.doCancelEquipment(action.reservation);
  }

  private doReject(reservation: UnifiedReservation): void {
    this.processingId = reservation.id;
    this.reservationService.reject(reservation.id).pipe(
      catchError(error => {
        this.uiService.showError(error?.message || 'Não foi possível rejeitar a reserva.');
        return of(null);
      }),
      finalize(() => this.processingId = null)
    ).subscribe(updated => {
      if (updated) {
        this.loadReservations();
        this.uiService.showSuccess(`Reserva de ${updated.user.name} rejeitada.`);
      }
    });
  }

  cancelSpaceReservation(reservation: UnifiedReservation): void {
    this.openConfirm({
      kind: 'cancel-space',
      reservation,
      title: 'Cancelar reserva',
      description: `Tem certeza que deseja cancelar a reserva de ${reservation.user?.name}? O morador será notificado.`,
      confirmLabel: 'Cancelar reserva',
      icon: 'lucideBan',
    });
  }

  private doCancelSpace(reservation: UnifiedReservation): void {
    this.processingId = reservation.id;
    this.reservationService.delete(reservation.id).pipe(
      catchError(error => {
        this.uiService.showError(error?.message || 'Não foi possível cancelar a reserva.');
        return of(null);
      }),
      finalize(() => this.processingId = null)
    ).subscribe(result => {
      if (result !== null) {
        this.loadReservations();
        this.uiService.showSuccess(`Reserva cancelada.`);
      }
    });
  }

  cancelEquipmentReservation(reservation: UnifiedReservation): void {
    this.openConfirm({
      kind: 'cancel-equipment',
      reservation,
      title: 'Cancelar reserva',
      description: `Deseja realmente cancelar a reserva da televisão para ${this.formatDate(reservation.date)} (${reservation.startTime} - ${reservation.endTime})?`,
      confirmLabel: 'Cancelar reserva',
      icon: 'lucideBan',
    });
  }

  private doCancelEquipment(reservation: UnifiedReservation): void {
    this.processingId = reservation.id;
    this.equipmentService.cancel(reservation.id).pipe(
      catchError(error => {
        this.uiService.showError(error?.error?.message || error?.message || 'Não foi possível cancelar a reserva.');
        return of(null);
      }),
      finalize(() => this.processingId = null)
    ).subscribe(result => {
      if (result) {
        this.loadReservations();
        this.uiService.showSuccess('Reserva da TV cancelada.');
      }
    });
  }

  getDay(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.getDate().toString();
  }

  getMonth(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  }

  getSpaceTypeLabel(type: string): string {
    return getSpaceCatalogEntry(type)?.name || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      [ReservationStatus.PENDING]: 'Pendente',
      [ReservationStatus.APPROVED]: 'Aprovada',
      [ReservationStatus.REJECTED]: 'Rejeitada',
      [ReservationStatus.CANCELLED]: 'Cancelada',
      CONFIRMED: 'Confirmado',
      IN_USE: 'Em Uso',
      RETURNED: 'Devolvido',
      CANCELED: 'Cancelado'
    };
    return labels[status] || status;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR');
  }

  openNewReservation(): void {
    if (this.typeFilter === 'TELEVISAO') {
      void this.navigation.push(APP_ROUTES.homeTvNew);
      return;
    }

    this.draft.reset();
    this.draft.setStackPrefix('reservations');
    void this.navigation.push(APP_ROUTES.reservationsSpace);
  }
}
