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
  private readonly ACCESS_COOKIE = 'auth_access_token';
  private readonly REFRESH_COOKIE = 'auth_refresh_token';
  private readonly USER_KEY = 'auth_user';
  private readonly LEGACY_REFRESH_KEY = 'auth_refresh_token';

  private readonly ACCESS_MAX_AGE_SECONDS = 2 * 60 * 60;
  private readonly REFRESH_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

  saveAccessToken(token: string, expiresInSeconds?: number): void {
    const maxAge = expiresInSeconds ?? this.getTokenTtlSeconds(token) ?? this.ACCESS_MAX_AGE_SECONDS;
    this.setCookie(this.ACCESS_COOKIE, token, maxAge);
  }

  getAccessToken(): string | null {
    return this.getCookie(this.ACCESS_COOKIE);
  }

  saveRefreshToken(token: string): void {
    this.setCookie(this.REFRESH_COOKIE, token, this.REFRESH_MAX_AGE_SECONDS);
    localStorage.removeItem(this.LEGACY_REFRESH_KEY);
  }

  getRefreshToken(): string | null {
    const fromCookie = this.getCookie(this.REFRESH_COOKIE);
    if (fromCookie) return fromCookie;

    const legacy = localStorage.getItem(this.LEGACY_REFRESH_KEY);
    if (legacy) {
      this.saveRefreshToken(legacy);
      return legacy;
    }

    return null;
  }

  saveTokens(accessToken: string, refreshToken: string, accessExpiresIn?: number): void {
    this.saveAccessToken(accessToken, accessExpiresIn);
    this.saveRefreshToken(refreshToken);
  }

  clearTokens(): void {
    this.deleteCookie(this.ACCESS_COOKIE);
    this.deleteCookie(this.REFRESH_COOKIE);
    localStorage.removeItem(this.LEGACY_REFRESH_KEY);
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

  isAuthenticated(): boolean {
    return !!this.getAccessToken() || !!this.getRefreshToken();
  }

  private getTokenTtlSeconds(token: string): number | null {
    const payload = this.decodeTokenPayload(token) as JwtPayloadClaims | null;
    if (!payload?.exp || typeof payload.exp !== 'number') return null;

    const ttl = Math.floor(payload.exp - Date.now() / 1000);
    return ttl > 0 ? ttl : 0;
  }

  private setCookie(name: string, value: string, maxAgeSeconds: number): void {
    if (typeof document === 'undefined') return;

    const parts = [
      `${name}=${encodeURIComponent(value)}`,
      'Path=/',
      `Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`,
      'SameSite=Lax',
    ];

    if (typeof location !== 'undefined' && location.protocol === 'https:') {
      parts.push('Secure');
    }

    document.cookie = parts.join('; ');
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const prefix = `${name}=`;
    for (const part of document.cookie.split(';')) {
      const cookie = part.trim();
      if (cookie.startsWith(prefix)) {
        return decodeURIComponent(cookie.slice(prefix.length));
      }
    }

    return null;
  }

  private deleteCookie(name: string): void {
    this.setCookie(name, '', 0);
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
}
