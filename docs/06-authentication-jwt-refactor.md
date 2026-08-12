# Authentication — JWT Access + Refresh Tokens

> **Scope:** Frontend implementation of the JWT auth layer after the backend refactor.
> Backend contract: `POST /lunaLink/auth/login`, `POST /lunaLink/auth/refresh`, `POST /lunaLink/auth/logout`.

---

## 1. Why this changed

The backend previously returned a **single raw JWT string** (2h lifetime, no refresh).
After the security hardening refactor it now issues a **token pair**:

- **accessToken** — short-lived (2h / `expiresIn: 7200`), sent as `Authorization: Bearer <accessToken>` on every protected request.
- **refreshToken** — long-lived (30 days), stored only on the client, exchanged for a new pair when the access token expires.

The login response is no longer plain text. It is a JSON DTO:

```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "expiresIn": 7200,
  "tokenType": "Bearer"
}
```

### Contract summary

| Endpoint | Request | Response | Notes |
|----------|---------|----------|-------|
| `POST /lunaLink/auth/login` | `{ email, password }` | `{ accessToken, refreshToken, expiresIn, tokenType }` | No auth header |
| `POST /lunaLink/auth/refresh` | `{ refreshToken }` | same DTO | **Rotation**: the previous refresh token is revoked; reusing a revoked token revokes the whole family → 401 |
| `POST /lunaLink/auth/logout` | `{ refreshToken }` (optional) | `200` empty | Also blacklists the current access token's `jti` from the `Authorization` header |

### Error semantics

| Status | Meaning |
|--------|---------|
| `401` (login, empty body) | Bad credentials |
| `429` (login, empty body) | Rate limit / temporary lockout (5 failed attempts → 10 min block) |
| `401` (refresh, `StandardErrorDTO` body) | Refresh token invalid / reused / expired |

---

## 2. Token storage strategy

| Token | Storage | Why |
|-------|---------|-----|
| **accessToken** | **In-memory only** (module/service variable) | XSS-safe; never persisted to disk |
| **refreshToken** | **`localStorage`** under key `auth_refresh_token` | Needed to restore the session across page reloads |

Because the access token lives only in memory, every page reload starts with an
empty access token. The session is restored lazily: the first protected request
goes out without an `Authorization` header, receives a `401`, and the refresh
interceptor silently exchanges the stored refresh token for a new pair.

---

## 3. Implementation map

| File | Responsibility |
|------|----------------|
| `src/app/core/models/user.model.ts` | `TokenDTO` (shared shape), `RefreshRequestDTO`, `LogoutRequestDTO` |
| `src/app/core/storage/token-storage.service.ts` | Access token in memory, refresh token in `localStorage`, user profile, token decode/role helpers, `isAuthenticated()` |
| `src/app/services/auth.service.ts` | `login()`, `refreshToken()`, `logout()`, `forceLogout()`; fetches `/users/me` |
| `src/app/core/interceptors/auth.interceptor.ts` | Attaches `Authorization: Bearer <access>` to protected requests |
| `src/app/core/interceptors/refresh.interceptor.ts` | Handles `401` → single-flight refresh → retry (or logout) |
| `src/app/core/interceptors/error.interceptor.ts` | Formats HTTP errors into a friendly `{ status, message }` shape |
| `src/main.ts` | Registers the three interceptors via `withInterceptors([auth, refresh, error])` |
| `src/app/core/guards/auth.guard.ts` | `authGuard` / `roleGuard` / `adminGuard` — unchanged logic, relies on `TokenStorageService.isAuthenticated()` |

Interceptor order matters: **auth → refresh → error**. The error interceptor runs
first on the response, so the refresh interceptor reads the (formatted) error and
the auth interceptor is the only one that writes headers.

---

## 4. Login flow

```
POST /lunaLink/auth/login { email, password }
        │
        ▼
AuthService.login()
  ├─ saveTokens(accessToken, refreshToken)      // access → memory, refresh → localStorage
  ├─ clearUser()                                // previous session profile
  ├─ isAuthenticated$ → true
  └─ GET /lunaLink/users/me                     // populate current user profile
        └─ TokenStorageService.saveUser(...)    // id, name, email, role, apartment
```

On failure the `errorInterceptorFn` maps the response:

- `401` → "Email ou senha incorretos."
- `429` → "Muitas tentativas. Aguarde alguns minutos e tente novamente."

The login page shows the message via `UiService.showError`.

---

## 5. Refresh flow (access token expired)

Triggered automatically when a protected request returns `401`.

```
Protected request → 401
        │
        ▼
refreshInterceptorFn (single-flight gate)
  ├─ isRefreshing? 
  │    ├─ NO  → start refresh: AuthService.refreshToken()
  │    │        POST /auth/refresh { refreshToken }  → saveTokens(new pair)
  │    └─ YES → subscribe to the SAME refresh$ (shareReplay) — no second request
  │
  ├─ refresh succeeded → retry original request
  │        └─ clone with new `Authorization: Bearer <newAccess>`
  │           (header set manually — the auth interceptor does not re-run for the retry)
  │
  └─ refresh failed → AuthService.forceLogout()
       └─ clearTokens() + navigate('/login')
```

Concurrency safety:

- **Single-flight** — concurrent `401`s share one in-flight refresh; no duplicate
  `/auth/refresh` calls (prevents refresh-token reuse / family revocation).
- **No infinite retry loop** — the retried request is marked with an
  `HttpContextToken` (`RETRIED`); if it fails again with `401` (e.g.
  `token_version` changed after a password reset) the session is force-logged-out.
- **Always latest token** — every refresh stores the rotated refresh token before
  retrying, so a subsequent refresh always uses the newest value.

### Page reload

On reload the access token is gone (memory). `isAuthenticated()` is still `true`
because the refresh token exists, so the guard lets the route through. The first
API call 401s and the interceptor performs the silent refresh described above —
from the user's perspective the session is restored automatically.

---

## 6. Logout flow

```
AuthService.logout()
  ├─ POST /lunaLink/auth/logout { refreshToken }   // revoke refresh server-side
  │    (best-effort: failure is ignored)
  └─ forceLogout()                                  // always runs
       └─ clearTokens() + isAuthenticated$ → false + navigate('/login')
```

The `Authorization` header is still sent on logout so the backend can blacklist
the current access token's `jti`. If the access token is already expired the
backend ignores it and the refresh revocation still takes effect.

---

## 7. JWT payload (decode helpers)

The backend now includes more claims. `TokenStorageService.decodeTokenPayload()`
reads the payload without verifying the signature:

- **sub** — user email
- **roles** — list of roles (e.g. `["ADMIN_ROLE"]`)
- **exp** — expiration timestamp (used by `isAccessTokenExpired(bufferSeconds = 60)`)
- **iat**, **nbf**, **aud**, **jti**, **token_version** — verification claims; not
  used client-side except for `exp` expiry checks

---

## 8. Verification checklist

1. `ng build` passes.
2. Login with valid credentials → lands on `/tabs/home`, user profile loaded.
3. Login with wrong credentials → toast "Email ou senha incorretos."
4. Repeated failed logins → toast with the rate-limit message (`429`).
5. Simulate access expiry (or reload the page) → next request succeeds silently
   via the refresh interceptor; no redirect to login.
6. Revoke the refresh token (logout in another tab, or password change) →
   next request logs the user out to `/login`.
7. Logout → backend receives `POST /auth/logout`; local storage is cleared.
