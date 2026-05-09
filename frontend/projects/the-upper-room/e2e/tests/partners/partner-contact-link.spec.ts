// traces_to: L2-036
import { test, expect } from '@playwright/test';
import { PartnerDetailPage } from '../../pages/PartnerDetailPage';
import { LinkContactDialog } from '../../components/LinkContactDialog';

const partner = {
  id: 'p1',
  name: 'Grace Church',
  website: 'https://grace.org',
  cityId: 'Toronto',
  contactCount: 0,
  tags: [],
  archived: false,
  logo: null,
  descriptionMarkdown: null,
  addresses: [],
  socialLinks: [],
};

const contact1 = { id: 'c1', name: 'Alice Smith', cityId: 'Toronto' };

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Partner:Create', 'Contact:Read'] });
  });

  await page.route('/api/v1/notifications**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });
}

test('link a contact with role → row appears in contacts tab', async ({ page }) => {
  const linkedContacts: typeof contact1[] = [];

  await page.route('**/api/v1/partners/p1', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(partner) });
  });
  await page.route('**/api/v1/partners/p1/contacts', (route) => {
    if (route.request().method() === 'POST') {
      linkedContacts.push(contact1);
      void route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ contactId: 'c1', role: 'Primary Contact' }) });
    } else {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: linkedContacts, total: linkedContacts.length }) });
    }
  });
  await page.route('**/api/v1/contacts**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [contact1], total: 1 }) });
  });

  await seedLead(page);
  const detail = new PartnerDetailPage(page);
  await detail.goto('p1');
  await detail.tab('contacts').click();

  await page.getByTestId('partner-link-contact-button').click();

  const dialog = new LinkContactDialog(page);
  await expect(dialog.dialog()).toBeVisible();
  await dialog.searchInput().fill('Alice');
  await expect(dialog.result('Alice Smith')).toBeVisible();
  await dialog.result('Alice Smith').click();
  await dialog.roleInput().fill('Primary Contact');
  await dialog.confirmButton().click();

  await expect(page.getByTestId('partner-linked-contact-c1')).toBeVisible();
  await expect(page.getByTestId('partner-linked-contact-c1')).toContainText('Alice Smith');
});

test('unlink contact shows confirmation and snackbar', async ({ page }) => {
  const linked = [{ ...contact1, role: 'Primary Contact' }];

  await page.route('**/api/v1/partners/p1', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(partner) });
  });
  await page.route('**/api/v1/partners/p1/contacts', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: linked, total: 1 }) });
  });
  await page.route('**/api/v1/partners/p1/contacts/c1', (route) => {
    void route.fulfill({ status: 204, body: '' });
  });

  await seedLead(page);
  const detail = new PartnerDetailPage(page);
  await detail.goto('p1');
  await detail.tab('contacts').click();

  await page.getByTestId('partner-unlink-contact-c1').click();
  await page.getByRole('button', { name: /discard|unlink|confirm/i }).click();

  await expect(page.getByTestId('partner-linked-contact-c1')).not.toBeVisible();
});

test('linking same contact twice shows 409 message', async ({ page }) => {
  await page.route('**/api/v1/partners/p1', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(partner) });
  });
  await page.route('**/api/v1/partners/p1/contacts', (route) => {
    if (route.request().method() === 'POST') {
      void route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ error: 'Contact is already linked to this partner.' }) });
    } else {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [{ ...contact1, role: 'Primary Contact' }], total: 1 }) });
    }
  });
  await page.route('**/api/v1/contacts**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [contact1], total: 1 }) });
  });

  await seedLead(page);
  const detail = new PartnerDetailPage(page);
  await detail.goto('p1');
  await detail.tab('contacts').click();

  await page.getByTestId('partner-link-contact-button').click();

  const dialog = new LinkContactDialog(page);
  await dialog.result('Alice Smith').click();
  await dialog.confirmButton().click();

  await expect(page.getByTestId('link-contact-error')).toBeVisible();
  await expect(page.getByTestId('link-contact-error')).toContainText('already linked');
});
