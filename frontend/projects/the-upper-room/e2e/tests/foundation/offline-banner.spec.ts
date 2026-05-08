// traces_to: L2-070
import { test, expect } from '@playwright/test';
import { OfflineBanner } from '../../components/OfflineBanner';

test('offline → banner; back online → "Back online"; auto-dismiss', async ({ context, page }) => {
  await page.goto('/dashboard-stub');
  const banner = new OfflineBanner(page);
  await context.setOffline(true);
  await expect(banner.text()).toHaveText(
    "You're offline. Some features may be unavailable.",
    { timeout: 3000 },
  );

  await context.setOffline(false);
  await expect(banner.text()).toHaveText('Back online');
  await expect(banner.root()).toBeHidden({ timeout: 5000 });
});

test('manual close stays closed until next state change', async ({ context, page }) => {
  await page.goto('/dashboard-stub');
  const banner = new OfflineBanner(page);
  await context.setOffline(true);
  await expect(banner.root()).toBeVisible();
  await banner.closeBtn().click();
  await expect(banner.root()).toBeHidden();

  // Same state: still hidden
  await page.waitForTimeout(500);
  await expect(banner.root()).toBeHidden();

  // State change → reappear
  await context.setOffline(false);
  await expect(banner.text()).toHaveText('Back online');
});
