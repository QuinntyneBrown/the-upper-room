// traces_to: L2-112
import { test, expect } from '@playwright/test';
import { ContactsListPage } from '../../pages/ContactsListPage';

function makeContacts(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: `c${i + 1}`,
    name: `Contact ${String(i + 1).padStart(2, '0')}`,
    cityId: 'Toronto',
    phones: [], emails: [], tags: [], archived: false,
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

test('MD+ viewport shows paginator with 60 contacts', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  const all = makeContacts(60);
  await page.route('**/api/v1/contacts**', (r) => {
    const url = new URL(r.request().url());
    const page_num = parseInt(url.searchParams.get('page') ?? '1');
    const size = parseInt(url.searchParams.get('size') ?? '25');
    const start = (page_num - 1) * size;
    const items = all.slice(start, start + size);
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items, total: 60 }) });
  });
  await seedLead(page);
  const contacts = new ContactsListPage(page);
  await contacts.goto();
  await expect(page.getByTestId('contacts-paginator')).toBeVisible();
  await expect(page.getByTestId('contacts-page-info')).toContainText('1 – 25 of 60');
});

test('XS infinite scroll appends next page on scroll', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const all = makeContacts(60);
  let requestCount = 0;
  await page.route('**/api/v1/contacts**', (r) => {
    requestCount++;
    const url = new URL(r.request().url());
    const page_num = parseInt(url.searchParams.get('page') ?? '1');
    const size = parseInt(url.searchParams.get('size') ?? '25');
    const start = (page_num - 1) * size;
    const items = all.slice(start, start + size);
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items, total: 60 }) });
  });
  await seedLead(page);
  const contacts = new ContactsListPage(page);
  await contacts.goto();
  await expect(contacts.cardByName('Contact 01')).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await expect(contacts.cardByName('Contact 26')).toBeVisible();
});
