import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private toastController: ToastController) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocorreu um erro';

        if (error.error instanceof ErrorEvent) {
          errorMessage = `Erro do cliente: ${error.error.message}`;
        } else if (error.status === 0) {
          errorMessage = 'Não foi possível conectar ao servidor. Verifique se a API está rodando.';
        } else if (error.status === 400) {
          if (error.error?.validationErrors) {
            const messages = Object.values(error.error.validationErrors);
            errorMessage = messages.join(', ');
          } else {
            errorMessage = error.error?.message || 'Dados inválidos';
          }
        } else if (error.status === 401) {
          errorMessage = 'Email ou senha incorretos.';
        } else if (error.status === 403) {
          errorMessage = 'Acesso negado.';
        } else if (error.status === 404) {
          errorMessage = 'Recurso não encontrado.';
        } else if (error.status === 409) {
          errorMessage = error.error?.message || 'Conflito de dados';
        } else if (error.status >= 500) {
          errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
        } else {
          errorMessage = error.error?.message || error.message || 'Ocorreu um erro';
        }

        this.showError(errorMessage);
        return throwError(() => ({ status: error.status, message: errorMessage, error: error.error }));
      })
    );
  }

  private showError(message: string): void {
    this.toastController.create({
      message,
      duration: 4000,
      position: 'top',
      color: 'danger'
    }).then(toast => toast.present());
  }
}
