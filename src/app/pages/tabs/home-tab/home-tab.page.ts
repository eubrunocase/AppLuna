import { Component, DestroyRef, afterNextRender, inject, OnInit, viewChild, ElementRef } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideClipboardList,
  lucideInfo,
  lucideLogOut,
  lucideMoonStar,
  lucidePackage,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { AuthService } from '../../../services/auth.service';
import { ReservationService } from '../../../services/reservation.service';
import { DeliveryService } from '../../../services/delivery.service';
import { UiService } from '../../../shared/services/ui.service';
import { catchError, of } from 'rxjs';

interface HomeQuickAction {
  id: string;
  label: string;
  iconSrc: string;
}

@Component({
  selector: 'app-home-tab',
  templateUrl: './home-tab.page.html',
  styleUrl: './home-tab.page.scss',
  standalone: true,
  imports: [IonContent, NgIcon, HlmButtonImports, HlmCardImports],
  providers: [
    provideIcons({
      lucideMoonStar,
      lucideClipboardList,
      lucidePackage,
      lucideCalendar,
      lucideLogOut,
      lucideInfo,
    }),
  ],
})
export class HomeTabPage implements OnInit {
  private authService = inject(AuthService);
  private reservationService = inject(ReservationService);
  private deliveryService = inject(DeliveryService);
  private uiService = inject(UiService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  private statsGridRef = viewChild<ElementRef>('statsGrid');

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

  ngOnInit(): void {
    this.refreshUserState();

    afterNextRender(() => {
      this.bindStatsOverlap();
    });
  }

  ionViewWillEnter(): void {
    this.refreshUserState();
  }

  async confirmLogout(): Promise<void> {
    const confirmed = await this.uiService.showConfirm(
      'Confirmar saída',
      'Deseja realmente sair da sua conta?',
      'Sair',
      'Cancelar',
    );
    if (confirmed) {
      this.authService.logout();
    }
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
    this.router.navigate(['/tabs/reservations'], {
      queryParams: { view: 'all', status: 'PENDING' },
    });
  }

  openNewReservation(): void {
    this.router.navigate(['/reservations/new']);
  }

  openNewOccurrence(): void {
    this.router.navigate(['/occurrences/new']);
  }

  goToDeliveries(): void {
    this.router.navigate(['/tabs/deliveries']);
  }

  goToReservations(): void {
    this.router.navigate(['/tabs/reservations']);
  }

  openDeliveriesManagement(): void {
    this.router.navigate(['/deliveries']);
  }

  openEquipmentFlow(): void {
    this.router.navigate(['/equipment-reservations']);
  }

  openTVReservation(): void {
    this.router.navigate(['/equipment-reservations/new']);
  }

  openUsers(): void {
    this.router.navigate(['/users']);
  }

  openReports(): void {
    this.router.navigate(['/reports']);
  }

  private bindStatsOverlap(): void {
    const statsEl = this.statsGridRef()?.nativeElement as HTMLElement | undefined;
    const shell = statsEl?.closest('.home-shell') as HTMLElement | undefined;
    if (!statsEl || !shell) return;

    const updateHalfHeight = () => {
      const height = statsEl.getBoundingClientRect().height;
      shell.style.setProperty('--stat-half-height', `${height / 2}px`);
    };

    updateHalfHeight();

    const observer = new ResizeObserver(updateHalfHeight);
    observer.observe(statsEl);
    this.destroyRef.onDestroy(() => observer.disconnect());
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
      .filter(action => action.visible)
      .map(({ visible: _visible, ...action }) => action);
  }

  private loadStats(): void {
    this.deliveryService.findAll().pipe(
      catchError(() => of([])),
    ).subscribe(deliveries => {
      this.pendingDeliveries = deliveries.filter((d: { status: string }) => d.status === 'PENDING').length;
    });

    if (this.canSeeReservationsSummary) {
      const currentUser = this.authService.getCurrentUser();
      const reservations$ = this.isAdmin
        ? this.reservationService.getAll()
        : this.reservationService.getByUser(currentUser!.id);

      reservations$.pipe(
        catchError(() => of([])),
      ).subscribe(reservations => {
        this.activeReservations = reservations.filter((r: { status: string }) => r.status === 'APPROVED').length;
        if (this.isAdmin) {
          this.pendingApprovals = reservations.filter((r: { status: string }) => r.status === 'PENDING').length;
        }
      });
    }
  }
}
