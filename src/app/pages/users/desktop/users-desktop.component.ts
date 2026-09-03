import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBriefcase,
  lucideLayoutGrid,
  lucidePencil,
  lucidePlus,
  lucideRefreshCw,
  lucideSearch,
  lucideShieldCheck,
  lucideTrash2,
  lucideUser,
} from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { isResidentRole, ResponseUserDTO, UserRoles } from '../../../core/models';
import type { UsersRoleFilter } from '../mobile/users-mobile.component';

@Component({
  selector: 'app-users-desktop',
  templateUrl: './users-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FormsModule, NgIcon, HlmBadgeImports, HlmButtonImports, HlmInputImports, HlmSpinnerImports, HlmTableImports],
  providers: [
    provideIcons({
      lucideBriefcase,
      lucideLayoutGrid,
      lucidePencil,
      lucidePlus,
      lucideRefreshCw,
      lucideSearch,
      lucideShieldCheck,
      lucideTrash2,
      lucideUser,
    }),
  ],
})
export class UsersDesktopComponent {
  readonly roleFilters = input<{ value: UsersRoleFilter; label: string; icon: string }[]>([]);
  readonly roleFilter = input<UsersRoleFilter>('ALL');
  readonly searchQuery = input('');
  readonly isLoading = input(true);
  readonly filteredUsers = input<ResponseUserDTO[]>([]);
  readonly processingId = input<string | null>(null);
  readonly currentUserId = input<string | null>(null);

  readonly roleFilterChange = output<UsersRoleFilter>();
  readonly searchQueryChange = output<string>();
  readonly edit = output<ResponseUserDTO>();
  readonly deleteUser = output<ResponseUserDTO>();
  readonly create = output<void>();
  readonly refreshList = output<void>();

  getRoleLabel(role: string): string {
    if (role === UserRoles.ADMIN_ROLE) return 'Síndico';
    if (role === UserRoles.EMPLOYEE) return 'Funcionário';
    if (isResidentRole(role)) return 'Morador';
    return role;
  }

  roleVariant(role: string): 'default' | 'secondary' | 'outline' {
    if (role === UserRoles.ADMIN_ROLE) return 'default';
    if (role === UserRoles.EMPLOYEE) return 'secondary';
    return 'outline';
  }

  isCurrentUser(user: ResponseUserDTO): boolean {
    return this.currentUserId() === user.id;
  }
}
