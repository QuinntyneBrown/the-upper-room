// traces_to: L2-094
import { test, expect } from '@playwright/test';

test('HTTP 429 from API shows "Too many requests" snackbar', async ({ page }) => {
  await page.route('**/api/v1/notifications/preferences', (route) => {
    route.fulfill({
      status: 429,
      headers: { 'Retry-After': '60' },
      contentType: 'application/json',
      body: JSON.stringify({ error: 'rate_limit_exceeded' }),
    });
  });

  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('user-token');
    win.__setRbac?.({ roles: ['Member'], permissions: [] });
  });

  await page.goto('/settings/notifications');
  await expect(page.locator('tar-snackbar')).toContainText('Too many requests', { timeout: 3000 });
});
