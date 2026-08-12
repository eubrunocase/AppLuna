import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, finalize, shareReplay, switchMap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from '../storage/token-storage.service';

const AUTH_URLS = ['/auth/login', '/auth/refresh', '/auth/logout'];

const RETRIED_TOKEN = new HttpContextToken<boolean>(() => false);

let isRefreshing = false;
let refreshDone$: Observable<boolean> | null = null;

function isAuthUrl(url: string): boolean {
  return AUTH_URLS.some(authUrl => url.includes(authUrl));
}

/**
 * Em 401 de request protegido tenta um refresh silencioso e repete a requisição.
 * O refresh é single-flight: requisições concorrentes aguardam o mesmo refresh
 * e são repetidas com o novo access token. Se o refresh falhar, a sessão é
 * limpa e o usuário é levado ao login.
 */
export const refreshInterceptorFn: HttpInterceptorFn = (req, next) => {
  if (isAuthUrl(req.url) || req.context.get(RETRIED_TOKEN)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const tokenStorage = inject(TokenStorageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (!tokenStorage.getRefreshToken()) {
        authService.forceLogout();
        return throwError(() => error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshDone$ = authService.refreshToken().pipe(
          finalize(() => {
            isRefreshing = false;
            refreshDone$ = null;
          }),
          shareReplay({ refCount: true, bufferSize: 1 })
        );
      }

      return refreshDone$!.pipe(
        switchMap(ok => {
          if (!ok) {
            return throwError(() => error);
          }

          const accessToken = tokenStorage.getAccessToken();
          const retried = req.clone({
            context: req.context.set(RETRIED_TOKEN, true),
            ...(accessToken ? { setHeaders: { Authorization: `Bearer ${accessToken}` } } : {})
          });

          return next(retried).pipe(
            catchError((retryError: HttpErrorResponse) => {
              // Refresh válido mas access ainda rejeitado (ex: token_version mudou)
              if (retryError?.status === 401) {
                authService.forceLogout();
              }
              return throwError(() => retryError);
            })
          );
        })
      );
    })
  );
};
