// traces_to: L2-026
import { test, expect } from '@playwright/test';
import { UserListPage } from '../../pages/UserListPage';

const seedUsers = [
  { id: 'admin', email: 'admin@example.com', name: 'Admin', role: 'SystemAdmin', city: 'Toronto', status: 'Active', lastSignIn: '2026-05-01' },
  { id: 'lead', email: 'lead@example.com', name: 'Lead', role: 'CityLead', city: 'Toronto', status: 'Active', lastSignIn: '2026-05-02' },
  { id: 'member', email: 'member@example.com', name: 'Member', role: 'Member', city: 'Toronto', status: 'Active', lastSignIn: '2026-05-03' },
];

async function seedAdmin(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('admin-token');
    win.__setRbac?.({ roles: ['SystemAdmin'], permissions: ['User:Manage'] });
  });
}

test('renders headers and at least one row', async ({ page }) => {
  await page.route('**/api/v1/users**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: seedUsers, total: 3 }) }),
  );
  await seedAdmin(page);
  const list = new UserListPage(page);
  await list.goto();
  await expect(list.row('admin@example.com')).toBeVisible();
});

test('typing alice debounces 300ms then issues exactly one search request', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/v1/users**', (route) => {
    if (route.request().url().includes('search=alice')) calls += 1;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });
  await seedAdmin(page);
  const list = new UserListPage(page);
  await list.goto();
  await list.searchInput().fill('alice');
  await page.waitForTimeout(500);
  expect(calls).toBe(1);
});

test('Role=Member filter shows only members', async ({ page }) => {
  await page.route('**/api/v1/users**', (route) => {
    const url = new URL(route.request().url());
    const role = url.searchParams.get('role');
    const items = role === 'Member' ? seedUsers.filter((u) => u.role === 'Member') : seedUsers;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items, total: items.length }) });
  });
  await seedAdmin(page);
  const list = new UserListPage(page);
  await list.goto();
  await list.filterChip('Member').click();
  await expect(list.row('member@example.com')).toBeVisible();
  await expect(list.row('admin@example.com')).toHaveCount(0);
});

test('empty state when no matches', async ({ page }) => {
  await page.route('**/api/v1/users**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
  await seedAdmin(page);
  const list = new UserListPage(page);
  await list.goto();
  await list.searchInput().fill('zzz');
  await expect(list.emptyState()).toContainText('No users found');
});

test('changing page size updates query', async ({ page }) => {
  let lastUrl = '';
  await page.route('**/api/v1/users**', (route) => {
    lastUrl = route.request().url();
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: seedUsers, total: 3 }) });
  });
  await seedAdmin(page);
  const list = new UserListPage(page);
  await list.goto();
  await list.selectPageSize('50');
  await expect.poll(() => lastUrl).toContain('pageSize=50');
});
