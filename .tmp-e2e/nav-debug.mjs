import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4321';
const API = 'http://localhost:8080/lunaLink';

async function apiLogin() {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'otavio@gmail.com', password: 'admin@123' }),
  });
  return res.json();
}

async function apiMe(accessToken) {
  const res = await fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${accessToken}` } });
  return res.json();
}

async function seed(page, tokens, user) {
  await page.context().addCookies([
    { name: 'auth_access_token', value: tokens.accessToken, domain: '127.0.0.1', path: '/', expires: Math.floor(Date.now()/1000)+7200 },
    { name: 'auth_refresh_token', value: tokens.refreshToken, domain: '127.0.0.1', path: '/', expires: Math.floor(Date.now()/1000)+30*24*3600 },
  ]);
  await page.goto(`${BASE}/login`);
  await page.evaluate((u) => localStorage.setItem('auth_user', JSON.stringify({ id: u.id, name: u.name, email: u.email, role: u.role, apartment: u.apartment ?? '' })), user);
}

async function dump(page, label) {
  const info = await page.evaluate(() => ({
    url: location.href,
    home: !!document.querySelector('app-home-tab'),
    create: !!document.querySelector('app-reservation-create'),
    tabs: !!document.querySelector('app-tabs'),
    voltar: document.querySelectorAll('[aria-label="Voltar"]').length,
    novaReservaBtns: [...document.querySelectorAll('button')].filter(b => b.textContent?.includes('Nova Reserva')).length,
    ionPages: [...document.querySelectorAll('.ion-page')].map(p => ({
      hidden: p.classList.contains('ion-page-hidden'),
      tag: p.querySelector(':scope > *')?.tagName?.toLowerCase() ?? 'empty',
    })),
    errors: window.__navErrors ?? [],
  }));
  console.log(`[${label}]`, JSON.stringify(info, null, 2));
}

(async () => {
  const tokens = await apiLogin();
  const user = await apiMe(tokens.accessToken);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await seed(page, tokens, user);
  await page.goto(`${BASE}/tabs/home`);
  await page.waitForSelector('app-home-tab');
  await dump(page, 'home');

  await page.getByRole('button', { name: 'Nova Reserva' }).click();
  await page.waitForTimeout(1500);
  await dump(page, 'after-click');

  await page.goto(`${BASE}/tabs/reservations/new`);
  await page.waitForTimeout(1500);
  await dump(page, 'direct-goto');

  await browser.close();
})();
