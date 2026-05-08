// traces_to: L2-030
import { test, expect } from '@playwright/test';
import { ContactsListPage } from '../../pages/ContactsListPage';

function makeContacts(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: `c${i + 1}`,
    name: `Contact ${i + 1}`,
    cityId: 'Toronto',
    title: 'Pastor',
    org: 'Church',
    phones: [{ value: `416-000-00${String(i).padStart(2, '0')}`, primary: true }],
    emails: [{ value: `contact${i + 1}@example.com`, primary: true }],
    tags: [],
    archived: false,
  }));
}

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Contact:Create'] });
  });
}

test('at 768px viewport 12 contacts renders 2-column grid', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  const seed = makeContacts(12);
  await page.route('**/api/v1/contacts**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: seed, total: 12 }) }),
  );
  await seedLead(page);
  const contacts = new ContactsListPage(page);
  await contacts.goto();
  await expect(contacts.cardByName('Contact 1')).toBeVisible();
  const grid = contacts.grid();
  await expect(grid).toBeVisible();
  const gridStyle = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
  expect(gridStyle.split(' ').length).toBe(2);
});

test('each card shows name, primary phone, primary email', async ({ page }) => {
  const seed = [
    {
      id: 'c1',
      name: 'Bob Smith',
      cityId: 'Toronto',
      title: 'Elder',
      org: 'Grace Church',
      phones: [{ value: '416-555-1234', primary: true }],
      emails: [{ value: 'bob@grace.org', primary: true }],
      tags: [],
      archived: false,
    },
  ];
  await page.route('**/api/v1/contacts**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: seed, total: 1 }) }),
  );
  await seedLead(page);
  const contacts = new ContactsListPage(page);
  await contacts.goto();
  const card = contacts.cardByName('Bob Smith');
  await expect(card).toContainText('Bob Smith');
  await expect(card).toContainText('416-555-1234');
  await expect(card).toContainText('bob@grace.org');
});

test('search "bob" debounces 300ms then issues one network call', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/v1/contacts**', (route) => {
    if (route.request().url().includes('search=bob')) calls += 1;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });
  await seedLead(page);
  const contacts = new ContactsListPage(page);
  await contacts.goto();
  await contacts.searchInput().fill('bob');
  await page.waitForTimeout(500);
  expect(calls).toBe(1);
});

test('FAB visible at XS, hidden at MD+', async ({ page }) => {
  await page.route('**/api/v1/contacts**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
  await seedLead(page);
  const contacts = new ContactsListPage(page);

  await page.setViewportSize({ width: 375, height: 812 });
  await contacts.goto();
  await expect(contacts.fab()).toBeVisible();

  await page.setViewportSize({ width: 1024, height: 768 });
  await contacts.goto();
  await expect(contacts.fab()).toBeHidden();
});
