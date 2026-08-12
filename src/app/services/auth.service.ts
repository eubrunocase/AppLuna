import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, switchMap, of, map } from 'rxjs';
import { AuthenticationDTO, UserRoles, ResponseUserDTO, TokenDTO, RefreshRequestDTO, RefreshResponseDTO, LogoutRequestDTO } from '../core/models';
import { TokenStorageService } from '../core/storage/token-storage.service';
import { ApiConfigService } from '../core/api-config.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private apiConfig = inject(ApiConfigService);
  private router = inject(Router);

  private baseUrl = this.apiConfig.API_URL;

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.tokenStorage.isAuthenticated());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  login(payload: AuthenticationDTO): Observable<ResponseUserDTO | null> {
    return this.http.post<TokenDTO>(`${this.baseUrl}/auth/login`, payload).pipe(
      tap((tokens: TokenDTO) => {
        this.tokenStorage.saveTokens(tokens.accessToken, tokens.refreshToken);
        this.tokenStorage.clearUser();
        this.isAuthenticatedSubject.next(true);
      }),
      switchMap(() => this.fetchCurrentUser())
    );
  }

  /**
   * Troca o refresh token por um novo par de tokens (rotação no backend).
   * Em falha (expirado/reutilizado) limpa a sessão local e redireciona ao login.
   */
  refreshToken(): Observable<boolean> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) return of(false);

    const body: RefreshRequestDTO = { refreshToken };
    return this.http.post<RefreshResponseDTO>(`${this.baseUrl}/auth/refresh`, body).pipe(
      tap((tokens: RefreshResponseDTO) => {
        this.tokenStorage.saveTokens(tokens.accessToken, tokens.refreshToken);
        this.isAuthenticatedSubject.next(true);
      }),
      map(() => true),
      catchError(() => {
        this.forceLogout();
        return of(false);
      })
    );
  }

  /** Revoga a sessão no backend (best-effort) e limpa localmente. */
  logout(): void {
    const refreshToken = this.tokenStorage.getRefreshToken();
    const body: LogoutRequestDTO = { refreshToken };

    this.http.post<void>(`${this.baseUrl}/auth/logout`, body, { responseType: 'text' as 'json' }).pipe(
      catchError(() => of(null)),
      tap(() => this.forceLogout())
    ).subscribe();
  }

  /** Limpa a sessão local e redireciona para o login sem chamar a API. */
  forceLogout(): void {
    this.tokenStorage.clearTokens();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Busca os dados completos do usuário autenticado via /users/me.
   * Elimina a necessidade de varrer a lista de todos os usuários para encontrar o atual.
   */
  private fetchCurrentUser(): Observable<ResponseUserDTO | null> {
    return this.http.get<ResponseUserDTO>(`${this.baseUrl}/users/me`).pipe(
      tap((user: ResponseUserDTO) => {
        this.tokenStorage.saveUser({
          id: user.id,
          name: user.name,
          email: user.email,
          role: this.tokenStorage.normalizeRole(user.role as unknown as string),
          apartment: user.apartment
        });
      }),
      catchError(() => of(null))
    );
  }

  getCurrentUser(): { id: string; name: string; email: string; role: string; apartment: string } | null {
    return this.tokenStorage.getUser();
  }

  isAdmin(): boolean {
    const user = this.tokenStorage.getUser();
    return user?.role === UserRoles.ADMIN_ROLE;
  }

  isEmployee(): boolean {
    const user = this.tokenStorage.getUser();
    return user?.role === UserRoles.EMPLOYEE;
  }

  isResident(): boolean {
    const user = this.tokenStorage.getUser();
    return user?.role === UserRoles.RESIDENT_ROLE || user?.role === UserRoles.RESIDENTE_ROLE;
  }
}
