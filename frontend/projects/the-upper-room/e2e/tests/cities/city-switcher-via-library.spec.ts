// traces_to: L2-109
// Verifies TarCitySwitcher from domain library still works after move
import { test, expect } from '@playwright/test';
import { CitySwitcher } from '../../components/CitySwitcher';

async function seedAuthAdmin(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('admin-token');
    win.__setRbac?.({ roles: ['SystemAdmin'], permissions: ['City:Switch'] });
  });
}

test('city switcher renders in shell after library move', async ({ page }) => {
  await seedAuthAdmin(page);

  await page.route('/api/v1/cities**', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [{ id: '1', name: 'Ottawa', slug: 'ottawa', archived: false }] }),
    });
  });
  await page.route('/api/v1/contacts**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], totalCount: 0 }) });
  });

  await page.goto('/contacts');
  await page.waitForLoadState('networkidle');

  const switcher = new CitySwitcher(page);
  await expect(switcher.trigger()).toBeVisible();
});
