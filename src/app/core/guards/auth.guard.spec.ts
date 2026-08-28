import { authGuard, guestGuard, roleGuard } from './auth.guard';
import { UserRoles } from '../models';
import { TokenStorageService } from '../storage/token-storage.service';
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';

describe('auth guards', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TokenStorageService,
          useValue: {
            isAuthenticated: () => true,
            getUser: () => ({ role: UserRoles.ADMIN_ROLE }),
            normalizeRole: (r: string) => r,
            getRoleFromToken: () => UserRoles.ADMIN_ROLE,
          },
        },
        {
          provide: Router,
          useValue: { createUrlTree: (segments: string[]) => segments },
        },
      ],
    });
  });

  it('authGuard permite autenticado', () => {
    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
    expect(result).toBe(true);
  });

  it('guestGuard redireciona autenticado para home', () => {
    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));
    expect(result).not.toBe(true);
  });

  it('roleGuard permite admin', () => {
    const guard = roleGuard([UserRoles.ADMIN_ROLE]);
    const result = TestBed.runInInjectionContext(() => guard({} as never, {} as never));
    expect(result).toBe(true);
  });
});
