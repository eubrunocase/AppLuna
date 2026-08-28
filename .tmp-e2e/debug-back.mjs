import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4321';
const API = 'http://localhost:8080/lunaLink';

(async () => {
  const login = await (await fetch(`${API}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'otavio@gmail.com', password: 'admin@123' }),
  })).json();
  const user = await (await fetch(`${API}/users/me`, {
    headers: { Authorization: `Bearer ${login.accessToken}` },
  })).json();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.context().addCookies([
    { name: 'auth_access_token', value: login.accessToken, domain: '127.0.0.1', path: '/', expires: Math.floor(Date.now()/1000)+7200 },
    { name: 'auth_refresh_token', value: login.refreshToken, domain: '127.0.0.1', path: '/', expires: Math.floor(Date.now()/1000)+999999 },
  ]);
  await page.goto(`${BASE}/tabs/home`);
  await page.evaluate((u) => localStorage.setItem('auth_user', JSON.stringify(u)), user);
  await page.goto(`${BASE}/tabs/reservations/new`);
  await page.waitForTimeout(2000);
  const buttons = await page.locator('button').allTextContents();
  const labels = await page.locator('[aria-label]').evaluateAll(els => els.map(e => e.getAttribute('aria-label')));
  console.log('buttons:', buttons);
  console.log('aria-labels:', labels);
  await page.screenshot({ path: '.tmp-e2e/create-page.png', fullPage: true });
  await browser.close();
})();
