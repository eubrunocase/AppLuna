import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4321';
const API = 'http://localhost:8080/lunaLink';
const EMAIL = 'otavio@gmail.com';
const PASSWORD = 'admin@123';

async function apiLogin() {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`login API ${res.status}`);
  return res.json();
}

async function apiMe(accessToken) {
  const res = await fetch(`${API}/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`users/me ${res.status}`);
  return res.json();
}

async function seedSession(page, tokens, user) {
  await page.context().addCookies([
    {
      name: 'auth_access_token',
      value: tokens.accessToken,
      domain: '127.0.0.1',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 7200,
    },
    {
      name: 'auth_refresh_token',
      value: tokens.refreshToken,
      domain: '127.0.0.1',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 30 * 24 * 3600,
    },
  ]);

  await page.goto(`${BASE}/login`);
  await page.evaluate((u) => {
    localStorage.setItem('auth_user', JSON.stringify({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      apartment: u.apartment ?? '',
    }));
  }, user);
}

async function waitForHome(page) {
  await page.goto(`${BASE}/tabs/home`);
  await page.waitForURL(/\/tabs\/home/, { timeout: 15000 });
  await page.getByRole('heading', { name: 'Acesso Rápido' }).waitFor({ timeout: 15000 });
}

async function snapshot(page, label) {
  const url = page.url();
  const hiddenPages = await page.locator('.ion-page-hidden').count();
  const quick = page.getByRole('button', { name: 'Nova Reserva' });
  const quickVisible = await quick.isVisible().catch(() => false);
  let quickClickable = false;
  try {
    await quick.click({ timeout: 1500, trial: true });
    quickClickable = true;
  } catch {
    quickClickable = false;
  }
  console.log(`[${label}] url=${url} hidden=${hiddenPages} visible=${quickVisible} clickable=${quickClickable}`);
  return { url, hiddenPages, quickVisible, quickClickable };
}

(async () => {
  const tokens = await apiLogin();
  const user = await apiMe(tokens.accessToken);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  try {
    await seedSession(page, tokens, user);
    await waitForHome(page);
    await snapshot(page, 'start');

    for (let i = 1; i <= 3; i++) {
      console.log(`--- cycle ${i} ---`);
      await page.getByRole('button', { name: 'Nova Reserva' }).click();
      await page.waitForURL(/\/tabs\/reservations\/new/, { timeout: 10000 });
      await snapshot(page, `create-${i}`);

      await page.locator('[aria-label="Voltar"]').click({ force: true });
      await page.waitForURL(/\/tabs\/home/, { timeout: 10000 });
      const snap = await snapshot(page, `home-${i}`);
      if (!snap.quickClickable) throw new Error(`cycle ${i}: Nova Reserva não clicável após voltar`);
    }

    console.log('PASS: 3 ciclos Home -> Nova Reserva -> Voltar OK');
  } catch (e) {
    console.error('FAIL:', e.message);
    await page.screenshot({ path: '.tmp-e2e/failure.png', fullPage: true }).catch(() => {});
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
