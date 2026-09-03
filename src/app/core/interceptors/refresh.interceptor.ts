import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, finalize, shareReplay, switchMap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isAuthRequest, isTokenAuthFailure } from '../auth/auth-session.utils';
import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from '../storage/token-storage.service';

const RETRIED_TOKEN = new HttpContextToken<boolean>(() => false);

let isRefreshing = false;
let refreshDone$: Observable<boolean> | null = null;

/**
 * Interceptor mais interno: trata 401 antes da formatação de erro.
 * Tenta refresh silencioso e repete a requisição; em falha limpa a sessão
 * e redireciona ao login via AuthService.forceLogout().
 */
export const refreshInterceptorFn: HttpInterceptorFn = (req, next) => {
  if (isAuthRequest(req.url) || req.context.get(RETRIED_TOKEN)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const tokenStorage = inject(TokenStorageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!isTokenAuthFailure(error, req.url)) {
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
        switchMap((ok) => {
          if (!ok) {
            authService.forceLogout();
            return throwError(() => error);
          }

          const accessToken = tokenStorage.getAccessToken();
          const retried = req.clone({
            context: req.context.set(RETRIED_TOKEN, true),
            ...(accessToken ? { setHeaders: { Authorization: `Bearer ${accessToken}` } } : {}),
          });

          return next(retried).pipe(
            catchError((retryError: HttpErrorResponse) => {
              if (isTokenAuthFailure(retryError, req.url)) {
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
