// traces_to: L2-021
// Verifies SignOutService from domain library still works after move
import { test, expect } from '@playwright/test';
import { AppShell } from '../../components/AppShell';

async function seedAuth(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('user-token');
    win.__setRbac?.({ roles: ['Member'], permissions: [] });
  });
}

test('sign-out from avatar menu redirects to sign-in after library move', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/contacts');
  await page.waitForLoadState('networkidle');

  // Open avatar menu
  const shell = new AppShell(page);
  await shell.avatarTrigger().click();

  // Click sign out
  await page.getByTestId('sign-out-btn').click();

  // Confirm the dialog
  await page.getByRole('button', { name: /sign out/i }).last().click();

  // Should be redirected to sign-in
  await page.waitForURL(/sign-in/);
  await expect(page).toHaveURL(/sign-in/);
});
