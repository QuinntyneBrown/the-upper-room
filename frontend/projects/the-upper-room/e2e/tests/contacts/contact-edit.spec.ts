// traces_to: L2-032
import { test, expect } from '@playwright/test';
import { ContactFormPage } from '../../pages/ContactFormPage';

const existingContact = {
  id: 'c1',
  name: 'Alice Smith',
  firstName: 'Alice',
  lastName: 'Smith',
  cityId: 'Toronto',
  title: 'Pastor',
  org: 'Grace Church',
  phones: [],
  emails: [],
  tags: [],
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
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Contact:Create', 'Contact:Edit'] });
  });
}

test('edit first name → detail reflects new name with success snackbar', async ({ page }) => {
  await page.route('**/api/v1/contacts/c1', (route) => {
    if (route.request().method() === 'GET')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(existingContact) });
    if (route.request().method() === 'PUT')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...existingContact, name: 'Alicia Smith', firstName: 'Alicia' }) });
    return route.continue();
  });
  await seedLead(page);
  await page.goto('/contacts/c1/edit');
  const form = new ContactFormPage(page);
  await form.firstName().clear();
  await form.firstName().fill('Alicia');
  await form.submit().click();
  await expect(page).toHaveURL(/\/contacts\/c1/);
  await expect(page.getByTestId('snackbar')).toContainText('Contact updated');
});

test('concurrent edit 409 → form banner with Reload button', async ({ page }) => {
  await page.route('**/api/v1/contacts/c1', (route) => {
    if (route.request().method() === 'GET')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(existingContact) });
    if (route.request().method() === 'PUT')
      return route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ error: 'Conflict' }) });
    return route.continue();
  });
  await seedLead(page);
  await page.goto('/contacts/c1/edit');
  const form = new ContactFormPage(page);
  await form.firstName().clear();
  await form.firstName().fill('Changed');
  await form.submit().click();
  await expect(form.formBanner()).toContainText('modified elsewhere');
  await expect(page.getByTestId('contact-reload-button')).toBeVisible();
});
