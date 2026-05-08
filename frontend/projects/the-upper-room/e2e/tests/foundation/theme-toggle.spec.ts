// traces_to: L2-115
import { test, expect } from '@playwright/test';
import { AppearanceSettingsPage } from '../../pages/AppearanceSettingsPage';

test.describe('theme toggle', () => {
  test('default System: dark OS adds [data-theme=dark]', async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto('/dashboard-stub');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await ctx.close();
  });

  test('default System: light OS leaves no theme override', async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: 'light' });
    const page = await ctx.newPage();
    await page.goto('/dashboard-stub');
    const attr = await page.locator('html').getAttribute('data-theme');
    expect(attr === null || attr === 'light').toBe(true);
    await ctx.close();
  });

  test('Selecting Dark persists and reapplies on reload', async ({ page }) => {
    const ap = new AppearanceSettingsPage(page);
    await ap.goto();
    await ap.option('dark').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('Selecting Light issues PATCH /api/v1/users/me', async ({ page }) => {
    let body: unknown = null;
    await page.route('**/api/v1/users/me', async (route) => {
      if (route.request().method() === 'PATCH') {
        body = route.request().postDataJSON();
      }
      await route.fulfill({ status: 204, body: '' });
    });
    await page.evaluate(() => {
      const win = window as unknown as { __setTestToken?: (t: string) => void };
      win.__setTestToken?.('test-token');
    });
    const ap = new AppearanceSettingsPage(page);
    await ap.goto();
    await ap.option('light').click();
    await expect.poll(() => body).toEqual({ theme: 'light' });
  });
});
