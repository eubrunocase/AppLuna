const AUTH_URLS = ['/auth/login', '/auth/refresh', '/auth/logout'] as const;

const TOKEN_AUTH_FAILURE_PATTERNS = [
  /token\s*inv[aá]lid/i,
  /token\s*expirad/i,
  /unauthorized/i,
  /n[aã]o\s*autorizado/i,
  /sess[aã]o\s*expirad/i,
];

export function isAuthRequest(url: string): boolean {
  return AUTH_URLS.some((authUrl) => url.includes(authUrl));
}

export function isLoginRequest(url: string): boolean {
  return url.includes('/auth/login');
}

export function getHttpErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' ? status : null;
}

function extractErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return '';
  }

  const candidate = error as { message?: unknown; error?: unknown };

  if (typeof candidate.message === 'string') {
    return candidate.message;
  }

  if (candidate.error && typeof candidate.error === 'object') {
    const nested = candidate.error as { message?: unknown };
    if (typeof nested.message === 'string') {
      return nested.message;
    }
  }

  if (typeof candidate.error === 'string') {
    return candidate.error;
  }

  return '';
}

export function isTokenAuthFailure(error: unknown, requestUrl: string): boolean {
  if (isLoginRequest(requestUrl)) {
    return false;
  }

  const status = getHttpErrorStatus(error);
  if (status === 401) {
    return true;
  }

  const message = extractErrorMessage(error);
  if (!message) {
    return false;
  }

  return TOKEN_AUTH_FAILURE_PATTERNS.some((pattern) => pattern.test(message));
}
