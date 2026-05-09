// traces_to: L2-037
import { test, expect } from '@playwright/test';
import { PartnerFormPage } from '../../pages/PartnerFormPage';

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
  await page.route('/api/v1/notifications**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
}

test('name input is wrapped in a Material form field', async ({ page }) => {
  await seedLead(page);
  const form = new PartnerFormPage(page);
  await form.goto();
  const field = page.locator('mat-form-field').filter({ has: page.getByTestId('partner-name') });
  await expect(field).toBeVisible();
});

test('save button is a Material flat button', async ({ page }) => {
  await seedLead(page);
  const form = new PartnerFormPage(page);
  await form.goto();
  await expect(form.submit()).toHaveAttribute('mat-flat-button');
});

test('cancel button is a Material stroked button', async ({ page }) => {
  await seedLead(page);
  const form = new PartnerFormPage(page);
  await form.goto();
  await expect(form.cancel()).toHaveAttribute('mat-stroked-button');
});

test('visit link uses mat-icon for open_in_new', async ({ page }) => {
  await page.route('/api/v1/notifications**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
  await seedLead(page);
  const form = new PartnerFormPage(page);
  await form.goto();
  await form.websiteInput().fill('https://example.org');
  await expect(form.visitLink().locator('mat-icon')).toBeVisible();
});
