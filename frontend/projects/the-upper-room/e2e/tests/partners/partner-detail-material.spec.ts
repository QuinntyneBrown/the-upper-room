// traces_to: L2-036
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

async function seedAndNavigate(page: import('@playwright/test').Page): Promise<void> {
  await page.route('**/api/v1/partners/p1', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(partner) });
  });
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Partner:Create'] });
  });
  await page.route('/api/v1/notifications**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
  const detail = new PartnerDetailPage(page);
  await detail.goto('p1');
}

test('edit button is a Material stroked button', async ({ page }) => {
  await seedAndNavigate(page);
  await expect(page.getByTestId('partner-edit-button')).toHaveAttribute('mat-stroked-button');
});

test('archive button is a Material stroked button', async ({ page }) => {
  await seedAndNavigate(page);
  await expect(page.getByTestId('partner-archive-button')).toHaveAttribute('mat-stroked-button');
});

test('delete button is a Material flat button', async ({ page }) => {
  await seedAndNavigate(page);
  await expect(page.getByTestId('partner-delete-button')).toHaveAttribute('mat-flat-button');
});

test('website link uses mat-icon', async ({ page }) => {
  await seedAndNavigate(page);
  await expect(page.getByTestId('partner-website-link').locator('mat-icon')).toBeVisible();
});

test('tab navigation renders as mat-tab-group', async ({ page }) => {
  await seedAndNavigate(page);
  await expect(page.locator('mat-tab-group')).toBeVisible();
});

test('delete button opens confirm dialog with typed confirmation field', async ({ page }) => {
  await seedAndNavigate(page);
  await page.getByTestId('partner-delete-button').click();
  await expect(page.getByTestId('confirm-dialog')).toBeVisible();
  await expect(page.getByTestId('confirm-typed-input')).toBeVisible();
});
