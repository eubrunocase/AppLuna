import {
  getHttpErrorStatus,
  isAuthRequest,
  isLoginRequest,
  isTokenAuthFailure,
} from './auth-session.utils';

describe('auth-session.utils', () => {
  it('identifica endpoints de autenticação', () => {
    expect(isAuthRequest('http://localhost/lunaLink/auth/login')).toBe(true);
    expect(isAuthRequest('http://localhost/lunaLink/auth/refresh')).toBe(true);
    expect(isAuthRequest('http://localhost/lunaLink/reservation')).toBe(false);
  });

  it('identifica login', () => {
    expect(isLoginRequest('http://localhost/lunaLink/auth/login')).toBe(true);
    expect(isLoginRequest('http://localhost/lunaLink/auth/refresh')).toBe(false);
  });

  it('detecta 401 como falha de token fora do login', () => {
    const error = { status: 401, error: { message: 'Token inválido ou expirado' } };
    expect(isTokenAuthFailure(error, '/lunaLink/reservation')).toBe(true);
    expect(isTokenAuthFailure(error, '/lunaLink/auth/login')).toBe(false);
  });

  it('detecta mensagens de token inválido', () => {
    const error = { status: 403, message: 'Refresh token inválido' };
    expect(isTokenAuthFailure(error, '/lunaLink/reservation')).toBe(true);
  });

  it('extrai status de erro formatado pelo interceptor', () => {
    expect(getHttpErrorStatus({ status: 401, message: 'Sessão expirada' })).toBe(401);
  });
});
