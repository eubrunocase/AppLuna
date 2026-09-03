import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isLoginRequest, isTokenAuthFailure } from '../auth/auth-session.utils';
import { AuthService } from '../../services/auth.service';

/**
 * Formata erros HTTP em um objeto { status, message } amigável ao UI.
 * Falhas de autenticação (401 / token inválido) disparam forceLogout como rede de segurança.
 */
export const errorInterceptorFn: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isTokenAuthFailure(error, req.url)) {
        authService.forceLogout();
      }

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
        if (isLoginRequest(req.url)) {
          errorMessage = 'Email ou senha incorretos.';
        } else {
          errorMessage = 'Sessão expirada. Faça login novamente.';
        }
      } else if (error.status === 429) {
        errorMessage = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
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
