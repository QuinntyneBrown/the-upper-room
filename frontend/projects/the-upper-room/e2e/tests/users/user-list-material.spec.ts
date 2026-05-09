// traces_to: L2-026
import { test, expect, Page } from '@playwright/test';
import { UserListPage } from '../../pages/UserListPage';

const seedUsers = [
  { id: 'admin', email: 'admin@example.com', name: 'Admin', role: 'SystemAdmin', city: 'Toronto', status: 'Active', lastSignIn: '2026-05-01' },
  { id: 'lead', email: 'lead@example.com', name: 'Lead', role: 'CityLead', city: 'Toronto', status: 'Active', lastSignIn: '2026-05-02' },
];

async function seed(page: Page): Promise<void> {
  await page.route('**/api/v1/users**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: seedUsers, total: 2 }) }),
  );
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('admin-token');
    win.__setRbac?.({ roles: ['SystemAdmin'], permissions: ['User:Manage'] });
  });
  await page.route('/api/v1/notifications**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
}

test('role filter chips are mat-chip-option elements', async ({ page }) => {
  await seed(page);
  const list = new UserListPage(page);
  await list.goto();
  await expect(list.filterChip('Member')).toBeVisible();
  const tag = await list.filterChip('Member').evaluate((el) => el.tagName.toLowerCase());
  expect(tag).toBe('mat-chip-option');
});

test('page-size control is a mat-select', async ({ page }) => {
  await seed(page);
  const list = new UserListPage(page);
  await list.goto();
  await expect(list.pageSize()).toHaveAttribute('role', 'combobox');
  const field = page.locator('mat-form-field').filter({ has: list.pageSize() });
  await expect(field).toBeVisible();
});

test('user table uses mat-table', async ({ page }) => {
  await seed(page);
  const list = new UserListPage(page);
  await list.goto();
  await expect(list.row('admin@example.com')).toBeVisible();
  const tag = await list.row('admin@example.com').evaluate((el) => el.tagName.toLowerCase());
  expect(tag).toBe('tr');
  const tableEl = page.locator('table[mat-table]');
  await expect(tableEl).toBeVisible();
});

test('selecting page size 50 via mat-select fires request with pageSize=50', async ({ page }) => {
  let lastUrl = '';
  await page.route('**/api/v1/users**', (route) => {
    lastUrl = route.request().url();
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: seedUsers, total: 2 }) });
  });
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('admin-token');
    win.__setRbac?.({ roles: ['SystemAdmin'], permissions: ['User:Manage'] });
  });
  await page.route('/api/v1/notifications**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
  const list = new UserListPage(page);
  await list.goto();
  await list.selectPageSize('50');
  await expect.poll(() => lastUrl).toContain('pageSize=50');
});

test('mat-row has data-testid matching user email', async ({ page }) => {
  await seed(page);
  const list = new UserListPage(page);
  await list.goto();
  const row = list.row('lead@example.com');
  await expect(row).toBeVisible();
  await expect(row).toHaveAttribute('data-testid', 'user-row-lead@example.com');
});
