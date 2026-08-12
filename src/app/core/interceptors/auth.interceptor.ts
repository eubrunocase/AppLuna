import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../storage/token-storage.service';

const AUTH_URLS = ['/auth/login', '/auth/refresh'];

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  if (AUTH_URLS.some(authUrl => req.url.includes(authUrl))) {
    return next(req);
  }

  const token = inject(TokenStorageService).getAccessToken();

  if (token) {
    return next(req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    }));
  }

  return next(req);
};
