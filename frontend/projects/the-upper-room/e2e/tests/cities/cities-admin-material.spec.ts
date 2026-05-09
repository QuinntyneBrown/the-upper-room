// traces_to: L2-077
import { test, expect, Page } from '@playwright/test';
import { CitiesPage } from '../../pages/CitiesPage';

const seedCities = [
  { id: 'toronto', name: 'Toronto', slug: 'toronto', country: 'CA', archived: false, members: 10 },
  { id: 'ottawa', name: 'Ottawa', slug: 'ottawa', country: 'CA', archived: true, members: 5 },
];

async function seed(page: Page): Promise<void> {
  await page.route('**/api/v1/cities**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: seedCities }) }),
  );
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[]; userId?: string }) => void;
    };
    win.__setTestToken?.('admin');
    win.__setRbac?.({ roles: ['SystemAdmin'], permissions: ['City:Switch'], userId: 'admin' });
  });
  await page.route('/api/v1/notifications**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
}

test('cities table is a mat-table', async ({ page }) => {
  await seed(page);
  const cities = new CitiesPage(page);
  await cities.goto();
  await expect(page.locator('table[mat-table]')).toBeVisible();
});

test('city row is a mat-row with data-testid', async ({ page }) => {
  await seed(page);
  const cities = new CitiesPage(page);
  await cities.goto();
  const row = cities.row('toronto');
  await expect(row).toBeVisible();
  const tag = await row.evaluate((el) => el.tagName.toLowerCase());
  expect(tag).toBe('tr');
  await expect(row).toHaveAttribute('data-testid', 'city-row-toronto');
});

test('archive button is a mat-stroked-button', async ({ page }) => {
  await seed(page);
  const cities = new CitiesPage(page);
  await cities.goto();
  await expect(cities.archive('toronto')).toHaveAttribute('mat-stroked-button');
});

test('archived city row is visible and shows Archived status', async ({ page }) => {
  await seed(page);
  const cities = new CitiesPage(page);
  await cities.goto();
  await expect(cities.row('ottawa')).toContainText('Archived');
});

test('non-archived city shows archive button; archived city does not', async ({ page }) => {
  await seed(page);
  const cities = new CitiesPage(page);
  await cities.goto();
  await expect(cities.archive('toronto')).toBeVisible();
  await expect(cities.archive('ottawa')).toHaveCount(0);
});
