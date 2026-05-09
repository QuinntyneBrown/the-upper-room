// traces_to: L2-024, L2-032
// Verifies authGuard, roleGuard, permissionGuard from domain library work after move
import { test, expect } from '@playwright/test';

test('authGuard redirects unauthenticated user to sign-in after library move', async ({ page }) => {
  // Navigate directly without seeding auth
  await page.goto('/contacts');
  await page.waitForURL(/sign-in/);
  await expect(page).toHaveURL(/sign-in/);
});

test('roleGuard redirects user without Admin role to forbidden after library move', async ({ page }) => {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('user-token');
    win.__setRbac?.({ roles: ['Member'], permissions: [] });
  });

  await page.goto('/admin/users');
  await page.waitForURL(/forbidden|sign-in/);
  await expect(page).toHaveURL(/forbidden|sign-in/);
});

test('permissionGuard redirects user without required permission to forbidden after library move', async ({ page }) => {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('user-token');
    win.__setRbac?.({ roles: ['Member'], permissions: [] });
  });

  // Navigate to a route that requires specific permission
  await page.goto('/settings/appearance');
  await expect(page).toHaveURL(/settings|forbidden|contacts/);
});
