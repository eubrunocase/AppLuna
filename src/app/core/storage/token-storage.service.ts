import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface JwtPayloadClaims {
  sub?: string;
  role?: string;
  roles?: string[] | string;
  authorities?: string[] | string;
  authority?: string[] | string;
  scope?: string[] | string;
  scopes?: string[] | string;
  exp?: number;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  private readonly USER_KEY = 'auth_user';

  private accessToken: string | null = null;

  saveAccessToken(token: string): void {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  saveRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  saveTokens(accessToken: string, refreshToken: string): void {
    this.saveAccessToken(accessToken);
    this.saveRefreshToken(refreshToken);
  }

  clearTokens(): void {
    this.accessToken = null;
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  clearUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  saveUser(user: { id: string; name: string; email: string; role: string; apartment: string }): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify({
      ...user,
      role: this.normalizeRole(user.role)
    }));
  }

  getUser(): { id: string; name: string; email: string; role: string; apartment: string } | null {
    const user = localStorage.getItem(this.USER_KEY);
    if (!user) return null;

    try {
      const parsed = JSON.parse(user);
      return {
        ...parsed,
        role: this.normalizeRole(parsed.role)
      };
    } catch {
      return null;
    }
  }

  normalizeRole(role: string | null | undefined): string {
    const normalized = (role || '').trim().toUpperCase();

    if (normalized === 'RESIDENT_ROLE') {
      return 'RESIDENTE_ROLE';
    }

    if (normalized === 'ROLE_ADMIN_ROLE' || normalized === 'ROLE_ADMIN') {
      return 'ADMIN_ROLE';
    }

    if (normalized === 'ROLE_RESIDENTE_ROLE' || normalized === 'ROLE_RESIDENT_ROLE') {
      return 'RESIDENTE_ROLE';
    }

    if (normalized === 'ROLE_EMPLOYEE') {
      return 'EMPLOYEE';
    }

    return normalized;
  }

  decodeTokenPayload(token: string | null): Record<string, unknown> | null {
    if (!token) return null;

    try {
      return jwtDecode<JwtPayloadClaims>(token) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  isAccessTokenExpired(bufferSeconds = 60): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    const payload = this.decodeTokenPayload(token) as JwtPayloadClaims | null;
    if (!payload?.exp || typeof payload.exp !== 'number') return true;

    const expiresAtMs = payload.exp * 1000;
    return expiresAtMs - bufferSeconds * 1000 <= Date.now();
  }

  getRoleFromToken(token?: string | null): string | null {
    const payload = this.decodeTokenPayload(token ?? this.getAccessToken());
    if (!payload) return null;

    const candidates: unknown[] = [
      payload['roles'],
      payload['role'],
      payload['authorities'],
      payload['authority'],
      payload['scope'],
      payload['scopes']
    ];

    for (const candidate of candidates) {
      const role = this.extractRole(candidate);
      if (role) return this.normalizeRole(role);
    }

    return null;
  }

  getSubjectFromToken(token?: string | null): string | null {
    const payload = this.decodeTokenPayload(token ?? this.getAccessToken()) as JwtPayloadClaims | null;
    if (!payload?.sub || typeof payload.sub !== 'string') return null;

    const sub = payload.sub.trim();
    return sub || null;
  }

  private extractRole(candidate: unknown): string | null {
    if (!candidate) return null;

    if (typeof candidate === 'string') {
      const parts = candidate
        .split(/[\s,]+/)
        .map(value => value.trim())
        .filter(Boolean);

      const explicitRole = parts.find(value => {
        const upper = value.toUpperCase();
        return upper.includes('ROLE') || upper.includes('EMPLOYEE') || upper.includes('ADMIN') || upper.includes('RESIDENT');
      });

      return explicitRole || null;
    }

    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        const value = this.extractRole(item);
        if (value) return value;
      }
      return null;
    }

    if (typeof candidate === 'object') {
      const objectCandidate = candidate as Record<string, unknown>;

      const objectRole = this.extractRole(objectCandidate['role'])
        || this.extractRole(objectCandidate['authority'])
        || this.extractRole(objectCandidate['name'])
        || this.extractRole(objectCandidate['value']);

      return objectRole || null;
    }

    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken() || !!this.getRefreshToken();
  }
}
