import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, switchMap, of } from 'rxjs';
import { AuthenticationDTO, UserRoles, ResponseUserDTO } from '../core/models';
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

  constructor() {
    this.restoreUserFromToken();
  }

  login(payload: AuthenticationDTO): Observable<ResponseUserDTO | null> {
    return this.http.post(`${this.baseUrl}/auth/login`, payload, {
      responseType: 'text'
    }).pipe(
      tap((token: string) => {
        this.tokenStorage.saveToken(token);
        this.tokenStorage.clearUser();
        this.isAuthenticatedSubject.next(true);
      }),
      switchMap(() => this.fetchCurrentUser()),
      catchError(() => of(null))
    );
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

  private restoreUserFromToken(): void {
    if (!this.tokenStorage.isAuthenticated()) return;

    const tokenRole = this.tokenStorage.getRoleFromToken();
    if (!tokenRole) return;

    const currentUser = this.tokenStorage.getUser();
    const currentRole = this.tokenStorage.normalizeRole(currentUser?.role);
    const normalizedTokenRole = this.tokenStorage.normalizeRole(tokenRole);

    if (currentUser?.role && currentRole === normalizedTokenRole) return;

    // Role divergiu (ex: token renovado com role diferente) — limpa e força re-login
    this.tokenStorage.clearToken();
    this.isAuthenticatedSubject.next(false);
  }

  logout(): void {
    this.tokenStorage.clearToken();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
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
