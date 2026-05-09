// traces_to: L2-011
// Verifies BreadcrumbService from components library still works after move
import { test, expect } from '@playwright/test';
import { AppShell } from '../../components/AppShell';

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

test('breadcrumbs render Contacts crumb after library move', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/contacts');
  await page.waitForLoadState('networkidle');

  const shell = new AppShell(page);
  const nav = shell.breadcrumbs();
  await expect(nav).toBeVisible();
  await expect(nav).toContainText('Contacts');
});

test('breadcrumbs render nested segments after library move', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/contacts/new');
  await page.waitForLoadState('networkidle');

  const shell = new AppShell(page);
  const nav = shell.breadcrumbs();
  await expect(nav).toContainText('Contacts');
  await expect(nav).toContainText('New');
});
