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
  const logs = [];
  page.on('console', m => logs.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', e => logs.push(`PAGEERROR: ${e.message}`));

  await page.context().addCookies([
    { name: 'auth_access_token', value: tokens.accessToken, domain: '127.0.0.1', path: '/', expires: Math.floor(Date.now()/1000)+7200 },
    { name: 'auth_refresh_token', value: tokens.refreshToken, domain: '127.0.0.1', path: '/', expires: Math.floor(Date.now()/1000)+999999 },
  ]);
  await page.goto(`${BASE}/login`);
  await page.evaluate((u) => localStorage.setItem('auth_user', JSON.stringify({ ...u, apartment: u.apartment ?? '' })), user);
  await page.goto(`${BASE}/tabs/home`);
  await page.waitForTimeout(2000);
  logs.length = 0;
  await page.getByRole('button', { name: 'Nova Reserva' }).click();
  await page.waitForTimeout(3000);
  console.log('url', page.url());
  console.log('logs after click:\n' + logs.slice(-20).join('\n'));
  await browser.close();
})();
