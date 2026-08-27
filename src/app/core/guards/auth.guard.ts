import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenStorageService } from '../storage/token-storage.service';
import { UserRoles } from '../models';

export const authGuard: CanActivateFn = () => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  if (tokenStorage.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = () => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  if (tokenStorage.isAuthenticated()) {
    return router.createUrlTree(['/tabs/home']);
  }

  return true;
};

export const roleGuard = (allowedRoles: string[]): CanActivateFn => () => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  if (!tokenStorage.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const user = tokenStorage.getUser();
  const normalizedAllowedRoles = allowedRoles.map(role => tokenStorage.normalizeRole(role));
  const currentRole = tokenStorage.normalizeRole(user?.role || tokenStorage.getRoleFromToken());

  if (currentRole && normalizedAllowedRoles.includes(currentRole)) {
    return true;
  }

  router.navigate(['/tabs/home']);
  return false;
};

export const adminGuard: CanActivateFn = roleGuard([UserRoles.ADMIN_ROLE]);
