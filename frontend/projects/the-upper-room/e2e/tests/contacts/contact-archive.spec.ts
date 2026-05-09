// traces_to: L2-033
import { test, expect } from '@playwright/test';
import { ContactDetailPage } from '../../pages/ContactDetailPage';
import { ContactsListPage } from '../../pages/ContactsListPage';

const contact = {
  id: 'c1', name: 'Alice Smith', cityId: 'Toronto',
  title: 'Pastor', org: 'Grace Church',
  phones: [], emails: [], tags: [], archived: false,
};

const archivedContact = { ...contact, archived: true };

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Contact:Create', 'Contact:Archive'] });
  });
}

test('archive contact → snackbar with Undo → disappears from default list', async ({ page }) => {
  let archived = false;
  await page.route('**/api/v1/contacts/c1', (r) => {
    if (r.request().method() === 'PATCH') {
      archived = true;
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(archivedContact) });
    }
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(contact) });
  });
  await page.route('**/api/v1/contacts**', (r) => {
    const url = new URL(r.request().url());
    if (r.request().method() === 'GET' && !url.searchParams.get('archived')) {
      const items = archived ? [] : [contact];
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items, total: items.length }) });
    }
    return r.continue();
  });
  await seedLead(page);
  const detail = new ContactDetailPage(page);
  await detail.goto('c1');
  await detail.archiveButton().click();
  await expect(page.getByTestId('snackbar')).toContainText('Contact archived');
  await page.goto('/contacts');
  const list = new ContactsListPage(page);
  await expect(list.cardByName('Alice Smith')).toBeHidden();
});

test('Archived filter shows archived contact with subdued styling', async ({ page }) => {
  await page.route('**/api/v1/contacts**', (r) => {
    const url = new URL(r.request().url());
    const showArchived = url.searchParams.get('archived') === 'true';
    const items = showArchived ? [archivedContact] : [];
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items, total: items.length }) });
  });
  await seedLead(page);
  const list = new ContactsListPage(page);
  await list.goto();
  await list.filterChip('archived').click();
  const card = list.cardByName('Alice Smith');
  await expect(card).toBeVisible();
  const opacity = await card.evaluate((el) => getComputedStyle(el).opacity);
  expect(parseFloat(opacity)).toBeLessThan(1);
});
