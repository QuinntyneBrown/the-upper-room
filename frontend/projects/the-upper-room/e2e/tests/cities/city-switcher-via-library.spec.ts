// traces_to: L2-109
// Verifies TarCitySwitcher from domain library still works after move
import { test, expect } from '@playwright/test';
import { CitySwitcher } from '../../components/CitySwitcher';

async function seedAuthAdmin(page: import('@playwright/test').Page): Promise<void> {
  // First navigation bootstraps Angular and registers __setTestToken / __setRbac
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('admin-token');
    win.__setRbac?.({ roles: ['SystemAdmin'], permissions: ['City:Switch'] });
  });

  // Route cities API before the second navigation so TarCitySwitcher can load
  await page.route('/api/v1/cities**', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [{ id: '1', name: 'Ottawa', slug: 'ottawa', archived: false }] }),
    });
  });

  // Second navigation — now authenticated, AppShell renders with TarCitySwitcher
  await page.goto('/sign-in');
}

test('city switcher renders in shell after library move', async ({ page }) => {
  await seedAuthAdmin(page);

  const switcher = new CitySwitcher(page);
  await expect(switcher.trigger()).toBeVisible();
});

test('city selection changes scope', async ({ page }) => {
  await seedAuthAdmin(page);

  const switcher = new CitySwitcher(page);
  await switcher.trigger().click();
  await expect(switcher.option('ottawa')).toBeVisible();
  await switcher.option('ottawa').click();
  await expect(switcher.trigger()).toContainText('Ottawa');
});
