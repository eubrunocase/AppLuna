import { ChangeDetectorRef, Component, inject } from '@angular/core';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBarcode,
  lucideCircleCheck,
  lucideClock,
  lucideLayoutGrid,
  lucidePackage,
  lucidePackageCheck,
  lucidePlus,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { DeliveryService } from '../../../services/delivery.service';
import { AuthService } from '../../../services/auth.service';
import { ResponseDeliveryDTO, DeliveryStatus } from '../../../core/models';
import { AppNavigationService } from '../../../core/navigation/app-navigation.service';
import { APP_ROUTES } from '../../../core/navigation/app-routes';
import { AppShellService } from '../../../core/shell/app-shell.service';
import { LunaItemListComponent } from '../../../shared/components/luna-item-list/luna-item-list.component';
import { catchError, finalize, of } from 'rxjs';

type StatusFilter = DeliveriesTabStatusFilter;

@Component({
  selector: 'app-deliveries-tab',
  templateUrl: './deliveries-tab.page.html',
  standalone: true,
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmSkeletonImports,
    LunaItemListComponent,
  ],
  providers: [
    provideIcons({
      lucideBarcode,
      lucideCircleCheck,
      lucideClock,
      lucideLayoutGrid,
      lucidePackage,
      lucidePackageCheck,
      lucidePlus,
    }),
  ],
})
export class DeliveriesTabPage implements ViewWillEnter {
  private deliveryService = inject(DeliveryService);
  private authService = inject(AuthService);
  private navigation = inject(AppNavigationService);
  private shell = inject(AppShellService);
  private cdr = inject(ChangeDetectorRef);
  readonly layout = inject(LayoutService);

  deliveries: ResponseDeliveryDTO[] = [];
  filteredDeliveries: ResponseDeliveryDTO[] = [];
  isLoading = true;
  statusFilter: StatusFilter = 'ALL';
  canCreate = false;
  photoMap: Record<string, string> = {};
  private readonly photoById = new Map<string, string>();

  readonly skeletonItems = [1, 2, 3];

  readonly statusFilters: { value: StatusFilter; label: string; icon: string }[] = [
    { value: 'ALL', label: 'Todas', icon: 'lucideLayoutGrid' },
    { value: 'PENDING', label: 'Pendentes', icon: 'lucideClock' },
    { value: 'DELIVERED', label: 'Retiradas', icon: 'lucidePackageCheck' },
  ];

  private currentUserId: string | null = null;

  ionViewWillEnter(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserId = user?.id ?? null;
    this.canCreate = this.authService.isAdmin() || this.authService.isEmployee();
    this.loadDeliveries();
    this.shell.configure({
      title: 'Minhas Entregas',
      showBack: false,
      showLogo: true,
      showLogout: true,
      headerState: 'compact',
      progressStep: null,
      progressTotal: null,
    });
    this.shell.setExpandContent(null);
  }

  loadDeliveries(): void {
    if (!this.currentUserId) return;

    this.isLoading = true;
    this.cdr.markForCheck();

    this.deliveryService.findByUser(this.currentUserId).pipe(
      catchError(() => of([])),
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe(deliveries => {
      this.deliveries = deliveries;
      this.filterByStatus();
      this.resolvePhotos(deliveries);
    });
  }

  refresh(event: { target: { complete: () => void } }): void {
    this.loadDeliveries();
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

  getPhotoUrl(deliveryId: string): string | null {
    return this.photoById.get(deliveryId) ?? null;
  }

  private resolvePhotos(deliveries: ResponseDeliveryDTO[]): void {
    this.photoById.clear();
    this.photoMap = {};

    for (const delivery of deliveries) {
      if (!delivery.voucherKey) {
        continue;
      }

      this.deliveryService.getDownloadUrl(delivery.id).pipe(
        catchError(() => of(null)),
      ).subscribe((response) => {
        if (response?.downloadUrl) {
          this.photoById.set(delivery.id, response.downloadUrl);
          this.photoMap = { ...this.photoMap, [delivery.id]: response.downloadUrl };
          this.cdr.markForCheck();
        }
      });
    }
  }

  openCreate(): void {
    void this.navigation.push(APP_ROUTES.deliveriesNew);
  }

  getStatusLabel(status: DeliveryStatus): string {
    return status === DeliveryStatus.DELIVERED ? 'Retirada' : 'Pendente';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR') + ' às ' +
           date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}
