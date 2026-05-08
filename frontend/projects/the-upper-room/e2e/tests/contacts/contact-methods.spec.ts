// traces_to: L2-029, L2-032
import { test, expect } from '@playwright/test';
import { ContactFormPage } from '../../pages/ContactFormPage';

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Contact:Create'] });
  });
}

test('adding a phone moves focus to the new number input', async ({ page }) => {
  await seedLead(page);
  const form = new ContactFormPage(page);
  await form.goto();
  await form.addPhone().click();
  await expect(form.phoneInput(0)).toBeFocused();
});

test('invalid phone shows validation message', async ({ page }) => {
  await seedLead(page);
  const form = new ContactFormPage(page);
  await form.goto();
  await form.addPhone().click();
  await form.phoneInput(0).fill('not-a-number');
  await form.firstName().fill('Alice');
  await form.submit().click();
  await expect(form.phoneError(0)).toBeVisible();
});

test('two primary emails → save rejected with form banner', async ({ page }) => {
  await page.route('**/api/v1/contacts', (r) => {
    if (r.request().method() === 'POST')
      return r.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'x1', name: 'Test', cityId: 'Toronto' }) });
    return r.continue();
  });
  await seedLead(page);
  const form = new ContactFormPage(page);
  await form.goto();
  await form.firstName().fill('Test');
  await form.addEmail().click();
  await form.emailInput(0).fill('a@test.com');
  await form.addEmail().click();
  await form.emailInput(1).fill('b@test.com');
  await form.emailPrimary(0).check();
  await form.emailPrimary(1).check();
  await form.submit().click();
  await expect(form.formBanner()).toContainText('Only one primary email');
});

test('removing the last phone is allowed', async ({ page }) => {
  await seedLead(page);
  const form = new ContactFormPage(page);
  await form.goto();
  await form.addPhone().click();
  await expect(form.phoneRow(0)).toBeVisible();
  await form.removePhone(0).click();
  await expect(form.phoneRow(0)).toBeHidden();
});
