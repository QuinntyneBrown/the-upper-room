// traces_to: L2-034, L2-035
import { test, expect } from '@playwright/test';
import { PartnersListPage } from '../../pages/PartnersListPage';

const partner1 = {
  id: 'p1', name: 'Grace Church', website: 'https://grace.org',
  cityId: 'Toronto', contactCount: 3,
  tags: [{ id: 't1', name: 'VIP', color: 'purple' }],
  archived: false,
};

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Partner:Create'] });
  });
}

test('empty state shows prescribed copy and New partner button', async ({ page }) => {
  await page.route('**/api/v1/partners**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
  await seedLead(page);
  const partners = new PartnersListPage(page);
  await partners.goto();
  await expect(partners.emptyState()).toBeVisible();
  await expect(page.getByTestId('empty-heading')).toContainText('No partners yet');
  await expect(partners.newButton()).toBeVisible();
});

test('cards show partner name and website', async ({ page }) => {
  await page.route('**/api/v1/partners**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [partner1], total: 1 }) }),
  );
  await seedLead(page);
  const partners = new PartnersListPage(page);
  await partners.goto();
  const card = partners.cardByName('Grace Church');
  await expect(card).toBeVisible();
  await expect(card).toContainText('Grace Church');
  await expect(card).toContainText('grace.org');
});

test('archived filter shows subdued partner cards', async ({ page }) => {
  const archivedPartner = { ...partner1, archived: true };
  await page.route('**/api/v1/partners**', (r) => {
    const url = new URL(r.request().url());
    const showArchived = url.searchParams.get('archived') === 'true';
    const items = showArchived ? [archivedPartner] : [];
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items, total: items.length }) });
  });
  await seedLead(page);
  const partners = new PartnersListPage(page);
  await partners.goto();
  await partners.filterChip('archived').click();
  await expect(partners.cardByName('Grace Church')).toBeVisible();
});
