import { ChangeDetectorRef, Component, inject, OnInit, viewChild } from '@angular/core';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBarcode,
  lucideCheck,
  lucideCircleCheck,
  lucideClock,
  lucideLayoutGrid,
  lucidePackage,
  lucidePackageCheck,
  lucidePackageOpen,
  lucidePlus,
  lucideShieldCheck,
  lucideUser,
  lucideUserCheck,
} from '@ng-icons/lucide';
import { HlmAlertDialog, HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { DeliveryService } from '../../services/delivery.service';
import { UserService } from '../../services/user.service';
import { ResponseDeliveryDTO, UserSummaryDTO, DeliveryStatus, UserRoles } from '../../core/models';
import { AuthService } from '../../services/auth.service';
import { AppNavigationService } from '../../core/navigation/app-navigation.service';
import { APP_ROUTES } from '../../core/navigation/app-routes';
import { AppShellService } from '../../core/shell/app-shell.service';
import { catchError, finalize, of } from 'rxjs';

type StatusFilter = 'ALL' | 'PENDING' | 'DELIVERED';

@Component({
  selector: 'app-deliveries',
  templateUrl: './deliveries.page.html',
  styleUrl: './deliveries.page.scss',
  standalone: true,
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    CommonModule,
    FormsModule,
    NgIcon,
    HlmAlertDialogImports,
    HlmButtonImports,
    HlmCardImports,
    HlmFieldImports,
    HlmInputImports,
    HlmSkeletonImports,
  ],
  providers: [
    provideIcons({
      lucideBarcode,
      lucideCheck,
      lucideCircleCheck,
      lucideClock,
      lucideLayoutGrid,
      lucidePackage,
      lucidePackageCheck,
      lucidePackageOpen,
      lucidePlus,
      lucideShieldCheck,
      lucideUser,
      lucideUserCheck,
    }),
  ],
})
export class DeliveriesPage implements OnInit, ViewWillEnter {
  private deliveryService = inject(DeliveryService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private navigation = inject(AppNavigationService);
  private shell = inject(AppShellService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private readonly pickupDialog = viewChild.required<HlmAlertDialog>('pickupDialog');

  deliveries: ResponseDeliveryDTO[] = [];
  filteredDeliveries: ResponseDeliveryDTO[] = [];
  users: UserSummaryDTO[] = [];
  isLoading = false;
  statusFilter: StatusFilter = 'ALL';
  pickupName = '';
  private pendingDelivery: ResponseDeliveryDTO | null = null;

  canCreate = false;
  canConfirm = false;

  readonly skeletonItems = [1, 2, 3];

  readonly statusFilters: { value: StatusFilter; label: string; icon: string }[] = [
    { value: 'ALL', label: 'Todas', icon: 'lucideLayoutGrid' },
    { value: 'PENDING', label: 'Pendentes', icon: 'lucideClock' },
    { value: 'DELIVERED', label: 'Entregues', icon: 'lucidePackageCheck' },
  ];

  ngOnInit(): void {
    this.setupPermissions();
    this.loadData();
  }

  ionViewWillEnter(): void {
    this.shell.configure({
      title: 'Entregas',
      showBack: true,
      showLogo: false,
      showLogout: false,
      headerState: 'compact',
    });
    this.shell.setExpandContent(null);
  }

  private isHomeStack(): boolean {
    return this.router.url.includes('/app/home/');
  }

  private createRoute(): string {
    return this.isHomeStack() ? APP_ROUTES.homeDeliveriesNew : APP_ROUTES.deliveriesNew;
  }

  private setupPermissions(): void {
    const role = this.authService.getCurrentUser()?.role;
    this.canCreate = role === UserRoles.ADMIN_ROLE || role === UserRoles.EMPLOYEE;
    this.canConfirm = this.canCreate;
  }

  loadData(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.userService.getSummary().pipe(
      catchError(() => of([]))
    ).subscribe(users => {
      this.users = users;
    });

    this.deliveryService.findAll().pipe(
      catchError(() => of([])),
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe(deliveries => {
      this.deliveries = deliveries;
      this.filterByStatus();
    });
  }

  refresh(event: { target: { complete: () => void } }): void {
    this.loadData();
    setTimeout(() => event.target.complete(), 1000);
  }

  setStatusFilter(value: StatusFilter): void {
    this.statusFilter = value;
    this.filterByStatus();
  }

  filterByStatus(): void {
    if (this.statusFilter === 'ALL') {
      this.filteredDeliveries = [...this.deliveries];
    } else {
      this.filteredDeliveries = this.deliveries.filter(d => d.status === this.statusFilter);
    }
  }

  getUserName(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user?.name || userId;
  }

  getStatusLabel(status: DeliveryStatus): string {
    return status === DeliveryStatus.DELIVERED ? 'Entregue' : 'Pendente';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR');
  }

  openPickupDialog(delivery: ResponseDeliveryDTO): void {
    this.pendingDelivery = delivery;
    this.pickupName = '';
    this.pickupDialog().open();
  }

  confirmPickup(): void {
    const name = this.pickupName.trim();
    const delivery = this.pendingDelivery;
    if (!name || !delivery) return;

    this.pickupDialog().close();
    this.pendingDelivery = null;
    this.doConfirm(delivery.id, name);
  }

  private doConfirm(id: string, pickedUpBy: string): void {
    this.deliveryService.confirmReceipt(id, pickedUpBy).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      this.loadData();
    });
  }

  openCreateModal(): void {
    void this.navigation.push(this.createRoute());
  }
}
