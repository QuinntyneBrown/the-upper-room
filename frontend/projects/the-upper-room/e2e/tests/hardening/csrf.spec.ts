// traces_to: L2-096
import { test, expect } from '@playwright/test';

test('missing XSRF cookie on sign-out returns 403 and shows error', async ({ page }) => {
  await page.route('**/api/v1/auth/sign-out', (route) => {
    route.fulfill({
      status: 403,
      contentType: 'application/json',
      body: JSON.stringify({ code: 'csrf.invalid' }),
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

  await page.goto('/dashboard-stub');
  await page.getByTestId('avatar-trigger').click();
  await page.getByTestId('avatar-menu-sign-out').click();

  await expect(page.locator('tar-snackbar')).toContainText("couldn't be verified", { timeout: 3000 });
});
