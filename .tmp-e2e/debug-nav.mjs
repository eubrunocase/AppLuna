import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4321';
const API = 'http://localhost:8080/lunaLink';

async function login() {
  const tokens = await (await fetch(`${API}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'otavio@gmail.com', password: 'admin@123' }),
  })).json();
  const user = await (await fetch(`${API}/users/me`, {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  })).json();
  return { tokens, user };
}

async function seed(page, tokens, user) {
  await page.context().addCookies([
    { name: 'auth_access_token', value: tokens.accessToken, domain: '127.0.0.1', path: '/', expires: Math.floor(Date.now()/1000)+7200 },
    { name: 'auth_refresh_token', value: tokens.refreshToken, domain: '127.0.0.1', path: '/', expires: Math.floor(Date.now()/1000)+999999 },
  ]);
  await page.goto(`${BASE}/login`);
  await page.evaluate((u) => localStorage.setItem('auth_user', JSON.stringify({ ...u, apartment: u.apartment ?? '' })), user);
}

async function dump(page, label) {
  const url = page.url();
  const hasHeaderNovaReserva = await page.locator('.header-title', { hasText: 'Nova Reserva' }).count();
  const hasQuickNovaReserva = await page.getByRole('button', { name: 'Nova Reserva' }).count();
  const hasVoltar = await page.locator('[aria-label="Voltar"]').count();
  const hidden = await page.locator('.ion-page-hidden').count();
  console.log(`${label}: url=${url} headerNova=${hasHeaderNovaReserva} quickNova=${hasQuickNovaReserva} voltar=${hasVoltar} hidden=${hidden}`);
}

(async () => {
  const { tokens, user } = await login();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await seed(page, tokens, user);
  await page.goto(`${BASE}/tabs/home`);
  await page.waitForTimeout(1500);
  await dump(page, 'home');
  console.log('history', await page.evaluate(() => ({ href: location.href, path: location.pathname })));

  await page.getByRole('button', { name: 'Nova Reserva' }).click();
  try {
    await page.waitForURL(/\/tabs\/reservations\/new/, { timeout: 5000 });
    console.log('waitForURL: matched reservations/new');
  } catch {
    console.log('waitForURL: TIMEOUT still at', page.url());
  }
  await page.waitForTimeout(1000);
  console.log('history after click', await page.evaluate(() => ({ href: location.href, path: location.pathname })));
  await dump(page, 'after-click');

  await page.goto(`${BASE}/tabs/reservations/new`);
  await page.waitForTimeout(1500);
  await dump(page, 'direct-goto');

  await browser.close();
})();
