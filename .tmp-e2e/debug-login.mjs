import { chromium } from 'playwright';

const BASE = 'http://localhost:4321';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', m => console.log('CONSOLE', m.type(), m.text()));
  page.on('pageerror', e => console.log('PAGEERROR', e.message));
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(3000);
  await page.locator('input[formcontrolname="email"]').fill('otavio@gmail.com');
  await page.locator('input[formcontrolname="password"]').fill('admin@123');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForTimeout(5000);
  console.log('URL:', page.url());
  console.log('BODY:', (await page.locator('body').innerText()).slice(0, 500));
  await page.screenshot({ path: '.tmp-e2e/debug.png', fullPage: true });
  await browser.close();
})();
