import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, Router, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors, HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { inject, isDevMode } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  }

  return next(req);
};

const errorInterceptorFn: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocorreu um erro';

      if (error.status === 0) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique se a API está rodando.';
      } else if (error.status === 400) {
        if (error.error?.validationErrors) {
          const messages = Object.values(error.error.validationErrors);
          errorMessage = messages.join(', ');
        } else {
          errorMessage = error.error?.message || 'Dados inválidos';
        }
      } else if (error.status === 401) {
        const isLoginRequest = req.url.includes('/auth/login');
        if (isLoginRequest) {
          errorMessage = 'Email ou senha incorretos.';
        } else {
          errorMessage = 'Sessão expirada. Faça login novamente.';
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_USER_KEY);
          router.navigate(['/login']);
        }
      } else if (error.status === 403) {
        errorMessage = 'Você não tem permissão para esta ação.';
      } else if (error.status === 404) {
        errorMessage = 'Recurso não encontrado.';
      } else if (error.status === 409) {
        errorMessage = error.error?.message || 'Conflito de dados';
      } else if (error.status >= 500) {
        errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
      } else {
        errorMessage = error.error?.message || error.message || 'Ocorreu um erro';
      }

      return throwError(() => ({ status: error.status, message: errorMessage, error: error.error }));
    })
  );
};

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptors([authInterceptorFn, errorInterceptorFn])
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
});
