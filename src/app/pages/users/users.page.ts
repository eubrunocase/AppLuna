import { ChangeDetectorRef, Component, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBriefcase,
  lucideBuilding2,
  lucideLayoutGrid,
  lucideMail,
  lucidePencil,
  lucidePlus,
  lucideSearch,
  lucideShieldCheck,
  lucideTrash2,
  lucideTriangleAlert,
  lucideUser,
  lucideUsers,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { isResidentRole, ResponseUserDTO, UserRoles } from '../../core/models';
import { AppNavigationService } from '../../core/navigation/app-navigation.service';
import { APP_ROUTES } from '../../core/navigation/app-routes';
import { AppShellService } from '../../core/shell/app-shell.service';
import { UiService } from '../../shared/services/ui.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { LunaItemListComponent } from '../../shared/components/luna-item-list/luna-item-list.component';
import { catchError, EMPTY, finalize, of } from 'rxjs';

type RoleFilter = 'ALL' | UserRoles.ADMIN_ROLE | UserRoles.EMPLOYEE | UserRoles.RESIDENT_ROLE;

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrl: './users.page.scss',
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
    LunaItemListComponent,
  ],
  providers: [
    provideIcons({
      lucideBriefcase,
      lucideBuilding2,
      lucideLayoutGrid,
      lucideMail,
      lucidePencil,
      lucidePlus,
      lucideSearch,
      lucideShieldCheck,
      lucideTrash2,
      lucideTriangleAlert,
      lucideUser,
      lucideUsers,
    }),
  ],
})
export class UsersPage implements ViewWillEnter {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private navigation = inject(AppNavigationService);
  private shell = inject(AppShellService);
  private uiService = inject(UiService);
  private cdr = inject(ChangeDetectorRef);

  private readonly confirmDialog = viewChild.required<ConfirmDialogComponent>('confirmDialog');

  users: ResponseUserDTO[] = [];
  filteredUsers: ResponseUserDTO[] = [];
  isLoading = true;
  roleFilter: RoleFilter = 'ALL';
  searchQuery = '';
  processingId: string | null = null;

  confirmTitle = 'Excluir usuário';
  confirmDescription = '';
  confirmLabel = 'Excluir';
  private pendingDelete: ResponseUserDTO | null = null;

  readonly skeletonItems = [1, 2, 3];
  readonly compactSkeletonItems = [1, 2, 3, 4, 5, 6];

  get isCompactList(): boolean {
    return this.roleFilter !== 'ALL';
  }

  readonly roleFilters: { value: RoleFilter; label: string; icon: string }[] = [
    { value: 'ALL', label: 'Todos', icon: 'lucideLayoutGrid' },
    { value: UserRoles.RESIDENT_ROLE, label: 'Moradores', icon: 'lucideUser' },
    { value: UserRoles.EMPLOYEE, label: 'Funcionários', icon: 'lucideBriefcase' },
    { value: UserRoles.ADMIN_ROLE, label: 'Síndicos', icon: 'lucideShieldCheck' },
  ];

  ionViewWillEnter(): void {
    this.loadUsers();
    this.shell.configure({
      title: 'Usuários',
      subtitle: 'Gestão de moradores e equipe',
      showBack: true,
      showLogo: false,
      showLogout: false,
      headerState: 'compact',
      progressStep: null,
      progressTotal: null,
    });
    this.shell.setExpandContent(null);
  }

  loadUsers(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.userService.getAll().pipe(
      catchError(() => {
        void this.uiService.showError('Erro ao carregar usuários');
        return of([] as ResponseUserDTO[]);
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }),
    ).subscribe(users => {
      this.users = users;
      this.applyFilters();
    });
  }

  refresh(event: { target: { complete: () => void } }): void {
    this.loadUsers();
    setTimeout(() => event.target.complete(), 1000);
  }

  setRoleFilter(value: RoleFilter): void {
    this.roleFilter = value;
    this.applyFilters();
  }

  setSearchQuery(value: string): void {
    this.searchQuery = value;
    this.applyFilters();
  }

  getRoleLabel(role: string): string {
    if (role === UserRoles.ADMIN_ROLE) return 'Síndico';
    if (role === UserRoles.EMPLOYEE) return 'Funcionário';
    if (isResidentRole(role)) return 'Morador';
    return role;
  }

  getRoleModifier(role: string): string {
    if (role === UserRoles.ADMIN_ROLE) return UserRoles.ADMIN_ROLE;
    if (role === UserRoles.EMPLOYEE) return UserRoles.EMPLOYEE;
    if (isResidentRole(role)) return UserRoles.RESIDENT_ROLE;
    return role;
  }

  getRoleIcon(role: string): string {
    if (role === UserRoles.ADMIN_ROLE) return 'lucideShieldCheck';
    if (role === UserRoles.EMPLOYEE) return 'lucideBriefcase';
    return 'lucideUser';
  }

  isCurrentUser(user: ResponseUserDTO): boolean {
    return this.authService.getCurrentUser()?.id === user.id;
  }

  openCreate(): void {
    void this.navigation.push(APP_ROUTES.homeAdminUsersNew);
  }

  openEdit(user: ResponseUserDTO): void {
    void this.navigation.push(APP_ROUTES.homeAdminUsersEdit(user.id));
  }

  askDelete(user: ResponseUserDTO): void {
    if (this.isCurrentUser(user) || this.processingId) {
      return;
    }

    this.pendingDelete = user;
    this.confirmTitle = 'Excluir usuário';
    this.confirmDescription = `Excluir ${user.name}? Esta ação não pode ser desfeita.`;
    this.confirmLabel = 'Excluir';
    this.cdr.detectChanges();
    this.confirmDialog().open();
  }

  confirmDelete(): void {
    const user = this.pendingDelete;
    this.pendingDelete = null;
    if (!user) {
      return;
    }

    this.processingId = user.id;
    this.userService.delete(user.id).pipe(
      catchError(() => {
        void this.uiService.showError('Erro ao excluir usuário');
        return EMPTY;
      }),
      finalize(() => {
        this.processingId = null;
        this.cdr.markForCheck();
      }),
    ).subscribe(async () => {
      await this.uiService.showSuccess('Usuário excluído');
      this.loadUsers();
    });
  }

  private applyFilters(): void {
    const query = this.searchQuery.trim().toLowerCase();

    this.filteredUsers = this.users.filter(user => {
      const matchesRole =
        this.roleFilter === 'ALL' ||
        (this.roleFilter === UserRoles.RESIDENT_ROLE
          ? isResidentRole(user.role)
          : user.role === this.roleFilter);
      if (!matchesRole) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [user.name, user.email, user.apartment].some(value =>
        value.toLowerCase().includes(query),
      );
    });
  }
}
