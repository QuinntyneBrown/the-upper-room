// traces_to: L2-115
// Verifies ThemeService from domain library works after move
import { test, expect } from '@playwright/test';
import { AppearanceSettingsPage } from '../../pages/AppearanceSettingsPage';

async function seedAuth(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('user-token');
    win.__setRbac?.({ roles: ['Member'], permissions: [] });
  });
}

test('theme toggle applies dark class after library move', async ({ page }) => {
  await seedAuth(page);

  await page.route('/api/v1/users/me', (route) => void route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));

  const settingsPage = new AppearanceSettingsPage(page);
  await settingsPage.goto();

  await settingsPage.option('dark').click();

  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  expect(theme).toBe('dark');
});

test('theme persists after reload via localStorage after library move', async ({ page }) => {
  await seedAuth(page);

  await page.route('/api/v1/users/me', (route) => void route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.route('/api/v1/contacts**', (route) => void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], totalCount: 0 }) }));

  const settingsPage = new AppearanceSettingsPage(page);
  await settingsPage.goto();
  await settingsPage.option('dark').click();

  // Reload and check theme is applied
  await page.reload();
  await page.waitForLoadState('networkidle');
  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  expect(theme).toBe('dark');
});
