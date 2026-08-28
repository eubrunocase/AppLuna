import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4321';
const API = 'http://localhost:8080/lunaLink';

(async () => {
  const tokens = await (await fetch(`${API}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'otavio@gmail.com', password: 'admin@123' }),
  })).json();
  const user = await (await fetch(`${API}/users/me`, {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  })).json();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.context().addCookies([
    { name: 'auth_access_token', value: tokens.accessToken, domain: '127.0.0.1', path: '/', expires: Math.floor(Date.now()/1000)+7200 },
    { name: 'auth_refresh_token', value: tokens.refreshToken, domain: '127.0.0.1', path: '/', expires: Math.floor(Date.now()/1000)+999999 },
  ]);
  await page.goto(`${BASE}/tabs/home`);
  await page.evaluate((u) => localStorage.setItem('auth_user', JSON.stringify({ ...u, apartment: u.apartment ?? '' })), user);
  await page.reload();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Nova Reserva' }).click();
  await page.waitForTimeout(3000);
  console.log('url', page.url());
  console.log('voltar count', await page.locator('[aria-label="Voltar"]').count());
  console.log('header Nova Reserva', await page.locator('.header-title').count());
  console.log('body snippet', (await page.locator('body').innerText()).slice(0, 300));
  await browser.close();
})();
