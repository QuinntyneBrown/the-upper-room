// traces_to: L2-070
// Verifies OfflineBanner from components library works after move
import { test, expect } from '@playwright/test';
import { OfflineBanner } from '../../components/OfflineBanner';

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

test('offline banner appears when browser goes offline', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/contacts');
  await page.waitForLoadState('networkidle');

  const banner = new OfflineBanner(page);
  await expect(banner.root()).toBeHidden();

  // Simulate offline
  await page.evaluate(() => {
    window.dispatchEvent(new Event('offline'));
  });

  await expect(banner.root()).toBeVisible({ timeout: 2000 });
});

test('offline banner disappears when back online', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/contacts');
  await page.waitForLoadState('networkidle');

  // Go offline first
  await page.evaluate(() => {
    window.dispatchEvent(new Event('offline'));
  });

  const banner = new OfflineBanner(page);
  await expect(banner.root()).toBeVisible({ timeout: 2000 });

  // Come back online
  await page.evaluate(() => {
    window.dispatchEvent(new Event('online'));
  });

  // Banner should switch to "online" state briefly, then disappear
  await expect(banner.root()).toBeVisible({ timeout: 1000 });
  await expect(banner.root()).toBeHidden({ timeout: 5000 });
});
