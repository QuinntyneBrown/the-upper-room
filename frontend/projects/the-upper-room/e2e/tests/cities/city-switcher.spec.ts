// traces_to: L2-109
import { test, expect } from '@playwright/test';
import { CitySwitcher } from '../../components/CitySwitcher';

const cities = [
  { id: 'toronto', name: 'Toronto', slug: 'toronto', country: 'CA', archived: false },
  { id: 'vancouver', name: 'Vancouver', slug: 'vancouver', country: 'CA', archived: false },
  { id: 'old', name: 'Old Town', slug: 'old', country: 'CA', archived: true },
];

async function seed(page: import('@playwright/test').Page, role: 'SystemAdmin' | 'CityLead') {
  await page.route('**/api/v1/cities', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: cities }) }),
  );
  await page.goto('/dashboard-stub');
  await page.evaluate((r) => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[]; userId?: string; cityId?: string }) => void;
    };
    win.__setTestToken?.('admin');
    win.__setRbac?.({
      roles: [r],
      permissions: r === 'SystemAdmin' ? ['City:Switch'] : [],
      userId: 'me',
      cityId: 'toronto',
    });
  }, role);
}

test('SystemAdmin: switcher lists non-archived cities, current checkmarked', async ({ page }) => {
  await seed(page, 'SystemAdmin');
  const cs = new CitySwitcher(page);
  await cs.trigger().click();
  await expect(cs.option('toronto')).toContainText('Toronto');
  await expect(cs.option('toronto')).toContainText('✓');
  await expect(cs.option('vancouver')).toContainText('Vancouver');
  await expect(cs.option('old')).toHaveCount(0);
});

test('Selecting All cities shows the read-only banner', async ({ page }) => {
  await seed(page, 'SystemAdmin');
  const cs = new CitySwitcher(page);
  await cs.trigger().click();
  await cs.allCities().click();
  await expect(cs.banner()).toContainText('Switch to a single city');
});

test('CityLead does not see the switcher', async ({ page }) => {
  await seed(page, 'CityLead');
  const cs = new CitySwitcher(page);
  await expect(cs.trigger()).toHaveCount(0);
});
