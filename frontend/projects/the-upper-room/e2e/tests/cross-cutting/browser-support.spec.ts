// traces_to: L2-120
import { test, expect } from '@playwright/test';

const IE11_UA =
  'Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko';

test('banner appears for IE11 user-agent', async ({ browser }) => {
  const ctx = await browser.newContext({ userAgent: IE11_UA });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.getByTestId('browser-support-banner')).toBeVisible();
  await ctx.close();
});

test('no banner for modern Chrome', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('browser-support-banner')).toBeHidden();
});

test('banner is dismissable and does not reappear in same session', async ({ browser }) => {
  const ctx = await browser.newContext({ userAgent: IE11_UA });
  const page = await ctx.newPage();
  await page.goto('/');
  const banner = page.getByTestId('browser-support-banner');
  await expect(banner).toBeVisible();
  await page.getByTestId('browser-support-dismiss').click();
  await expect(banner).toBeHidden();

  await page.goto('/');
  await expect(page.getByTestId('browser-support-banner')).toBeHidden();
  await ctx.close();
});
