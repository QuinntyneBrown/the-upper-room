// traces_to: L2-032
import { test, expect } from '@playwright/test';
import { ContactFormPage } from '../../pages/ContactFormPage';

const existingContact = {
  id: 'c1', name: 'Alice Smith', firstName: 'Alice', lastName: 'Smith',
  cityId: 'Toronto', title: 'Pastor', org: 'Grace Church',
  phones: [], emails: [], tags: [], archived: false,
};

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Contact:Create', 'Contact:Edit'] });
  });
}

function routeContact(page: import('@playwright/test').Page): void {
  page.route('**/api/v1/contacts/c1', (r) => {
    if (r.request().method() === 'GET')
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(existingContact) });
    return r.continue();
  });
}

test('first name input is wrapped in a Material form field', async ({ page }) => {
  routeContact(page);
  await seedLead(page);
  await page.goto('/contacts/c1/edit');
  const field = page.locator('mat-form-field').filter({ has: page.getByTestId('contact-first-name') });
  await expect(field).toBeVisible();
});

test('save button is a Material flat button', async ({ page }) => {
  routeContact(page);
  await seedLead(page);
  await page.goto('/contacts/c1/edit');
  await expect(new ContactFormPage(page).submit()).toHaveAttribute('mat-flat-button');
});

test('cancel button is a Material stroked button', async ({ page }) => {
  routeContact(page);
  await seedLead(page);
  await page.goto('/contacts/c1/edit');
  await expect(new ContactFormPage(page).cancel()).toHaveAttribute('mat-stroked-button');
});

test('reload button in form banner is a Material text button', async ({ page }) => {
  await page.route('**/api/v1/contacts/c1', (r) => {
    if (r.request().method() === 'GET')
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(existingContact) });
    if (r.request().method() === 'PUT')
      return r.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ error: 'Conflict' }) });
    return r.continue();
  });
  await seedLead(page);
  await page.goto('/contacts/c1/edit');
  const form = new ContactFormPage(page);
  await form.firstName().clear();
  await form.firstName().fill('Changed');
  await form.submit().click();
  await expect(page.getByTestId('contact-reload-button')).toHaveAttribute('mat-button');
});
