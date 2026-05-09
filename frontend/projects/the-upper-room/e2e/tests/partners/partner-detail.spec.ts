// traces_to: L2-036
import { test, expect } from '@playwright/test';
import { PartnerDetailPage } from '../../pages/PartnerDetailPage';

const partnerWithWebsite = {
  id: 'p1',
  name: 'Grace Church',
  website: 'https://grace.org',
  cityId: 'Toronto',
  contactCount: 3,
  tags: [],
  archived: false,
  logo: null,
  descriptionMarkdown: '**Welcome** to Grace Church.',
  addresses: [],
  socialLinks: [],
};

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Partner:Create'] });
  });

  await page.route('/api/v1/notifications**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });
}

test('header shows letter fallback and partner name', async ({ page }) => {
  await page.route('**/api/v1/partners/p1', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(partnerWithWebsite) });
  });
  await seedLead(page);
  const detail = new PartnerDetailPage(page);
  await detail.goto('p1');

  await expect(detail.name()).toContainText('Grace Church');
  await expect(detail.letterAvatar()).toBeVisible();
});

test('website link has correct href and opens externally', async ({ page }) => {
  await page.route('**/api/v1/partners/p1', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(partnerWithWebsite) });
  });
  await seedLead(page);
  const detail = new PartnerDetailPage(page);
  await detail.goto('p1');

  const link = detail.websiteLink();
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', 'https://grace.org');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);
});

test('overview tab shows description', async ({ page }) => {
  await page.route('**/api/v1/partners/p1', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(partnerWithWebsite) });
  });
  await seedLead(page);
  const detail = new PartnerDetailPage(page);
  await detail.goto('p1');

  await expect(detail.overviewPanel()).toBeVisible();
  await expect(detail.description()).toBeVisible();
});
