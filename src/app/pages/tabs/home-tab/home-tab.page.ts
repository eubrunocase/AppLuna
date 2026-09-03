import { ChangeDetectorRef, Component, inject } from '@angular/core';
import {
  ViewWillEnter,
  ViewWillLeave,
} from '@ionic/angular/standalone';
import { AppNavigationService } from '../../../core/navigation/app-navigation.service';
import { APP_ROUTES } from '../../../core/navigation/app-routes';
import { AppShellService } from '../../../core/shell/app-shell.service';
import { LayoutService } from '../../../core/layout/layout.service';
import { AuthService } from '../../../services/auth.service';
import { ReservationService } from '../../../services/reservation.service';
import { DeliveryService } from '../../../services/delivery.service';
import { HomeHeaderExpandComponent } from './home-header-expand.component';
import { ReservationDraftService } from '../../reservations/reservation-draft.service';
import { HomeTabDesktopComponent } from './desktop/home-tab-desktop.component';
import { HomeTabMobileComponent } from './mobile/home-tab-mobile.component';
import { catchError, finalize, forkJoin, of } from 'rxjs';

interface HomeQuickAction {
  id: string;
  label: string;
  iconSrc: string;
}

@Component({
  selector: 'app-home-tab',
  templateUrl: './home-tab.page.html',
  standalone: true,
  imports: [HomeTabDesktopComponent, HomeTabMobileComponent],
})
export class HomeTabPage implements ViewWillEnter, ViewWillLeave {
  private authService = inject(AuthService);
  private reservationService = inject(ReservationService);
  private deliveryService = inject(DeliveryService);
  private navigation = inject(AppNavigationService);
  private shell = inject(AppShellService);
  private draft = inject(ReservationDraftService);
  private cdr = inject(ChangeDetectorRef);
  readonly layout = inject(LayoutService);

  isAdmin = false;
  isEmployee = false;
  isResident = false;

  userFirstName = 'Morador';
  userApartment = '';

  canCreateReservation = false;
  canCreateOccurrence = false;
  canManageDeliveries = false;
  canManageEquipment = false;
  canReserveEquipment = false;
  canSeeReservationsSummary = false;

  pendingDeliveries = 0;
  activeReservations = 0;
  pendingApprovals = 0;
  isLoadingStats = true;

  quickActions: HomeQuickAction[] = [];

  get userRoleLabel(): string {
    if (this.isAdmin) return 'Administrador';
    if (this.isEmployee) return 'Funcionário';
    return 'Morador';
  }

  get greeting(): string {
    const hour = new Date().getHours();
    const period = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
    return `${period}, ${this.userFirstName}`;
  }

  get statColumns(): number {
    let count = 1;
    if (this.isAdmin) count++;
    if (this.canSeeReservationsSummary) count++;
    return count;
  }

  get statSkeletonItems(): number[] {
    return Array.from({ length: this.statColumns }, (_, index) => index);
  }

  ionViewWillEnter(): void {
    this.refreshUserState();
    this.configureShell();
  }

  ionViewWillLeave(): void {
    this.shell.setExpandContent(null);
  }

  onContentScroll(event: CustomEvent): void {
    const scrollTop = event.detail.scrollTop;
    this.shell.collapseOnScroll(scrollTop > 48);
  }

  runQuickAction(id: string): void {
    switch (id) {
      case 'reservation':
        this.openNewReservation();
        break;
      case 'tv':
        this.openTVReservation();
        break;
      case 'occurrence':
        this.openNewOccurrence();
        break;
      case 'delivery':
        this.openDeliveriesManagement();
        break;
      case 'equipment':
        this.openEquipmentFlow();
        break;
      case 'users':
        this.openUsers();
        break;
      case 'reports':
        this.openReports();
        break;
    }
  }

  goToPendingApprovals(): void {
    void this.navigation.selectTab('reservations').then(() =>
      this.navigation.navigateWithinTab(`${APP_ROUTES.reservations}?view=all&status=PENDING`),
    );
  }

  openNewReservation(): void {
    this.draft.reset();
    this.draft.setStackPrefix('home');
    void this.navigation.push(APP_ROUTES.homeReservationSpace);
  }

  openNewOccurrence(): void {
    void this.navigation.push(APP_ROUTES.homeOccurrenceNew);
  }

  goToDeliveries(): void {
    void this.navigation.selectTab('deliveries');
  }

  goToReservations(): void {
    void this.navigation.selectTab('reservations');
  }

  openDeliveriesManagement(): void {
    void this.navigation.push(APP_ROUTES.homeDeliveriesManage);
  }

  openEquipmentFlow(): void {
    void this.navigation.push(APP_ROUTES.homeEquipmentManage);
  }

  openTVReservation(): void {
    void this.navigation.push(APP_ROUTES.homeTvNew);
  }

  openUsers(): void {
    void this.navigation.push(APP_ROUTES.homeAdminUsers);
  }

  openReports(): void {
    void this.navigation.push(APP_ROUTES.homeAdminReports);
  }

  private configureShell(): void {
    this.shell.configure({
      title: 'Lunalink',
      subtitle: '',
      showBack: false,
      showLogo: true,
      showLogout: true,
      headerState: 'expanded',
      progressStep: null,
      progressTotal: null,
    });
    this.shell.setExpandContent({
      component: HomeHeaderExpandComponent,
      inputs: {
        greeting: this.greeting,
        userApartment: this.userApartment,
        userRoleLabel: this.userRoleLabel,
      },
    });
  }

  private refreshUserState(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.userFirstName = user.name.split(' ')[0] || user.name;
    this.userApartment = user.apartment?.trim() ?? '';

    this.isAdmin = this.authService.isAdmin();
    this.isEmployee = this.authService.isEmployee();
    this.isResident = this.authService.isResident();

    this.canCreateReservation = this.isAdmin || this.isResident;
    this.canCreateOccurrence = this.isAdmin || this.isResident;
    this.canManageDeliveries = this.isAdmin || this.isEmployee;
    this.canManageEquipment = this.isAdmin || this.isEmployee;
    this.canReserveEquipment = this.isAdmin || this.isResident;
    this.canSeeReservationsSummary = this.isAdmin || this.isResident;

    this.buildQuickActions();
    this.loadStats();
  }

  private buildQuickActions(): void {
    const actions: Array<HomeQuickAction & { visible: boolean }> = [
      {
        id: 'reservation',
        label: 'Nova Reserva',
        iconSrc: 'assets/icons/quick-access/new-schedule.svg',
        visible: this.canCreateReservation,
      },
      {
        id: 'tv',
        label: 'Reservar TV',
        iconSrc: 'assets/icons/quick-access/monitor.svg',
        visible: this.canReserveEquipment,
      },
      {
        id: 'occurrence',
        label: 'Reportar Ocorrência',
        iconSrc: 'assets/icons/quick-access/alerta.svg',
        visible: this.canCreateOccurrence,
      },
      {
        id: 'delivery',
        label: 'Registrar Entrega',
        iconSrc: 'assets/icons/quick-access/encomendas.svg',
        visible: this.canManageDeliveries,
      },
      {
        id: 'equipment',
        label: 'Equipamentos',
        iconSrc: 'assets/icons/quick-access/equipamentos.svg',
        visible: this.canManageEquipment,
      },
      {
        id: 'users',
        label: 'Usuários',
        iconSrc: 'assets/icons/quick-access/usuario.svg',
        visible: this.isAdmin,
      },
      {
        id: 'reports',
        label: 'Relatórios',
        iconSrc: 'assets/icons/quick-access/relatorios.svg',
        visible: this.isAdmin,
      },
    ];

    this.quickActions = actions
      .filter((action) => action.visible)
      .map(({ visible: _visible, ...action }) => action);
  }

  private loadStats(): void {
    this.isLoadingStats = true;
    this.cdr.markForCheck();

    const deliveries$ = this.deliveryService.findAll().pipe(
      catchError(() => of([])),
    );

    if (!this.canSeeReservationsSummary) {
      deliveries$
        .pipe(finalize(() => this.stopStatsLoading()))
        .subscribe((deliveries) => {
          this.pendingDeliveries = deliveries.filter(
            (d: { status: string }) => d.status === 'PENDING',
          ).length;
        });
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    const reservations$ = this.isAdmin
      ? this.reservationService.getAll()
      : this.reservationService.getByUser(currentUser!.id);

    forkJoin({
      deliveries: deliveries$,
      reservations: reservations$.pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => this.stopStatsLoading()))
      .subscribe(({ deliveries, reservations }) => {
        this.pendingDeliveries = deliveries.filter(
          (d: { status: string }) => d.status === 'PENDING',
        ).length;
        this.activeReservations = reservations.filter(
          (r: { status: string }) => r.status === 'APPROVED',
        ).length;
        if (this.isAdmin) {
          this.pendingApprovals = reservations.filter(
            (r: { status: string }) => r.status === 'PENDING',
          ).length;
        }
      });
  }

  private stopStatsLoading(): void {
    this.isLoadingStats = false;
    this.cdr.markForCheck();
  }
}
