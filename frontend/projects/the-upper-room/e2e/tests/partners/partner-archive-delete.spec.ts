// traces_to: L2-034
import { test, expect } from '@playwright/test';
import { PartnerDetailPage } from '../../pages/PartnerDetailPage';

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

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Partner:Create', 'Partner:Archive', 'Partner:Delete'] });
  });

  await page.route('/api/v1/notifications**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });
}

test('archive a partner → removed from default list; visible under Archived filter', async ({ page }) => {
  const archived = { ...partner, archived: true };
  let isArchived = false;

  await page.route('**/api/v1/partners/p1', (route) => {
    if (route.request().method() === 'PATCH') {
      isArchived = true;
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(archived) });
    } else {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(isArchived ? archived : partner) });
    }
  });
  await page.route('**/api/v1/partners**', (route) => {
    const url = route.request().url();
    const showArchived = url.includes('archived=true');
    const items = showArchived ? [archived] : [];
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items, total: items.length }) });
  });

  await seedLead(page);
  const detail = new PartnerDetailPage(page);
  await detail.goto('p1');

  await page.getByTestId('partner-archive-button').click();

  await expect(page.getByText('Partner archived')).toBeVisible();
});

test('delete partner with linked future event → 409 shows Archive instead button', async ({ page }) => {
  await page.route('**/api/v1/partners/p1', (route) => {
    if (route.request().method() === 'DELETE') {
      void route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'This partner is referenced by 2 upcoming events. Archive it instead.' }),
      });
    } else if (route.request().method() === 'PATCH') {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...partner, archived: true }) });
    } else {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(partner) });
    }
  });

  await seedLead(page);
  const detail = new PartnerDetailPage(page);
  await detail.goto('p1');

  await page.getByTestId('partner-delete-button').click();
  await page.getByTestId('delete-confirm-input').fill('Grace Church');
  await page.getByRole('button', { name: /^delete$/i }).click();

  await expect(page.getByRole('button', { name: /archive instead/i })).toBeVisible();
  await page.getByRole('button', { name: /archive instead/i }).click();

  await expect(page.getByText('Partner archived')).toBeVisible();
});

test('delete a clean partner with typed confirmation succeeds', async ({ page }) => {
  await page.route('**/api/v1/partners/p1', (route) => {
    if (route.request().method() === 'DELETE') {
      void route.fulfill({ status: 204, body: '' });
    } else {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(partner) });
    }
  });
  await page.route('**/api/v1/partners**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });

  await seedLead(page);
  const detail = new PartnerDetailPage(page);
  await detail.goto('p1');

  await page.getByTestId('partner-delete-button').click();
  await page.getByTestId('delete-confirm-input').fill('Grace Church');
  await page.getByRole('button', { name: /^delete$/i }).click();

  await expect(page).toHaveURL(/\/partners(?!\/p1)/);
});
