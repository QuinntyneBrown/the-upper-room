// traces_to: L2-024
import { test, expect } from '@playwright/test';

test('unauthenticated /contacts redirects to /sign-in?returnUrl=%2Fcontacts', async ({ page }) => {
  await page.goto('/contacts');
  await expect(page).toHaveURL(/\/sign-in\?returnUrl=%2Fcontacts$/);
});

test('Member visiting /admin/users → /forbidden + warning snackbar', async ({ page }) => {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('member-token');
    win.__setRbac?.({ roles: ['Member'], permissions: ['Contact:Read'] });
  });
  await page.goto('/admin/users');
  await expect(page).toHaveURL(/\/forbidden$/);
  await expect(page.getByTestId('snackbar')).toContainText("don't have permission");
});

test('SystemAdmin visiting /admin/users loads', async ({ page }) => {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('admin-token');
    win.__setRbac?.({ roles: ['SystemAdmin'], permissions: ['User:Manage'] });
  });
  await page.goto('/admin/users');
  await expect(page).toHaveURL(/\/admin\/users$/);
});
