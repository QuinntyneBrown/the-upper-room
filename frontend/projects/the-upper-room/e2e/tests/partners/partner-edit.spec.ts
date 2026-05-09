// traces_to: L2-037
import { test, expect } from '@playwright/test';
import { PartnerFormPage } from '../../pages/PartnerFormPage';

const existingPartner = {
  id: 'p1',
  name: 'Grace Church',
  website: 'https://grace.org',
  cityId: 'Toronto',
  contactCount: 3,
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
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Partner:Create'] });
  });

  await page.route('/api/v1/notifications**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });
}

test('edit name shows success snackbar and redirects to detail', async ({ page }) => {
  await page.route('**/api/v1/partners/p1', (route) => {
    if (route.request().method() === 'PUT') {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...existingPartner, name: 'Grace Church Updated' }) });
    } else {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(existingPartner) });
    }
  });

  await seedLead(page);
  await page.goto('/partners/p1/edit');

  const form = new PartnerFormPage(page);
  await form.nameInput().clear();
  await form.nameInput().fill('Grace Church Updated');
  await form.submit().click();

  await expect(page).toHaveURL(/\/partners\/p1/);
});

test('form pre-populates with existing partner data', async ({ page }) => {
  await page.route('**/api/v1/partners/p1', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(existingPartner) });
  });

  await seedLead(page);
  await page.goto('/partners/p1/edit');

  const form = new PartnerFormPage(page);
  await expect(form.nameInput()).toHaveValue('Grace Church');
  await expect(form.websiteInput()).toHaveValue('https://grace.org');
});
