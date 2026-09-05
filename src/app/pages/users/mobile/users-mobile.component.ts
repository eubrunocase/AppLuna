import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
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
  lucideUser,
  lucideUsers,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { isResidentRole, ResponseUserDTO, UserRoles } from '../../../core/models';

export type UsersRoleFilter = 'ALL' | UserRoles.ADMIN_ROLE | UserRoles.EMPLOYEE | UserRoles.RESIDENT_ROLE;

@Component({
  selector: 'app-users-mobile',
  templateUrl: './users-mobile.component.html',
  styleUrl: './users-mobile.component.scss',
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
      lucideBriefcase,
      lucideBuilding2,
      lucideLayoutGrid,
      lucideMail,
      lucidePencil,
      lucidePlus,
      lucideSearch,
      lucideShieldCheck,
      lucideTrash2,
      lucideUser,
      lucideUsers,
    }),
  ],
})
export class UsersMobileComponent {
  readonly roleFilters = input<{ value: UsersRoleFilter; label: string; icon: string }[]>([]);
  readonly roleFilter = input<UsersRoleFilter>('ALL');
  readonly searchQuery = input('');
  readonly isLoading = input(true);
  readonly skeletonItems = input<number[]>([1, 2, 3]);
  readonly compactSkeletonItems = input<number[]>([1, 2, 3, 4, 5, 6]);
  readonly filteredUsers = input<ResponseUserDTO[]>([]);
  readonly itemSize = input(168);
  readonly compactItemSize = input(72);
  readonly processingId = input<string | null>(null);
  readonly currentUserId = input<string | null>(null);

  readonly refresh = output<{ target: { complete: () => void } }>();
  readonly roleFilterChange = output<UsersRoleFilter>();
  readonly searchQueryChange = output<string>();
  readonly edit = output<ResponseUserDTO>();
  readonly deleteUser = output<ResponseUserDTO>();
  readonly create = output<void>();

  readonly isCompactList = computed(() => this.roleFilter() !== 'ALL');
  readonly trackById = (_: number, item: ResponseUserDTO) => item.id;

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
    return this.currentUserId() === user.id;
  }
}
