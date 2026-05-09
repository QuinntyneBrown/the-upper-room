// traces_to: L2-037
import { test, expect } from '@playwright/test';
import { PartnerFormPage } from '../../pages/PartnerFormPage';

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

test('submit with valid name and website redirects to detail', async ({ page }) => {
  let createdId = '';
  await page.route('/api/v1/partners', (route) => {
    if (route.request().method() === 'POST') {
      createdId = 'p-new';
      void route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'p-new', name: 'New Partner', website: 'https://newpartner.org', cityId: 'Toronto', contactCount: 0, tags: [], archived: false }),
      });
    } else {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
    }
  });
  await page.route('/api/v1/partners/p-new', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'p-new', name: 'New Partner', website: 'https://newpartner.org', cityId: 'Toronto', contactCount: 0, tags: [], archived: false }) });
  });

  await seedLead(page);
  const form = new PartnerFormPage(page);
  await form.goto();
  await form.nameInput().fill('New Partner');
  await form.websiteInput().fill('https://newpartner.org');
  await form.submit().click();

  await expect(page).toHaveURL(/\/partners\/p-new/);
});

test('website without http:// shows validation error', async ({ page }) => {
  await page.route('/api/v1/notifications**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });
  await seedLead(page);
  const form = new PartnerFormPage(page);
  await form.goto();
  await form.nameInput().fill('My Partner');
  await form.websiteInput().fill('example.com');
  await form.submit().click();

  await expect(form.websiteError()).toBeVisible();
  await expect(form.websiteError()).toContainText('http://');
});

test('duplicate name returns 409 and shows banner', async ({ page }) => {
  await page.route('/api/v1/partners', (route) => {
    if (route.request().method() === 'POST') {
      void route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'A partner with this name already exists in your city.' }),
      });
    } else {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
    }
  });
  await page.route('/api/v1/notifications**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });

  await seedLead(page);
  const form = new PartnerFormPage(page);
  await form.goto();
  await form.nameInput().fill('Duplicate Partner');
  await form.submit().click();

  await expect(form.formBanner()).toBeVisible();
  await expect(form.formBanner()).toContainText('already exists');
});

test('cancel with dirty form shows discard dialog', async ({ page }) => {
  await page.route('/api/v1/notifications**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });
  await seedLead(page);
  const form = new PartnerFormPage(page);
  await form.goto();
  await form.nameInput().fill('Dirty Partner');
  await form.cancel().click();

  await expect(page.getByRole('dialog')).toBeVisible();
});
