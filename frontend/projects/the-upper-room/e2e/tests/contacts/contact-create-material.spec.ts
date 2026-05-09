// traces_to: L2-032, L2-029
import { test, expect } from '@playwright/test';
import { ContactFormPage } from '../../pages/ContactFormPage';

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Contact:Create'] });
  });
}

test('first name input is wrapped in a Material form field', async ({ page }) => {
  await seedLead(page);
  const form = new ContactFormPage(page);
  await form.goto();
  const field = page.locator('mat-form-field').filter({ has: page.getByTestId('contact-first-name') });
  await expect(field).toBeVisible();
});

test('save button is a Material flat button', async ({ page }) => {
  await seedLead(page);
  const form = new ContactFormPage(page);
  await form.goto();
  await expect(form.submit()).toHaveAttribute('mat-flat-button');
});

test('cancel button is a Material stroked button', async ({ page }) => {
  await seedLead(page);
  const form = new ContactFormPage(page);
  await form.goto();
  await expect(form.cancel()).toHaveAttribute('mat-stroked-button');
});

test('phone remove button is a Material icon button', async ({ page }) => {
  await seedLead(page);
  const form = new ContactFormPage(page);
  await form.goto();
  await form.addPhone().click();
  await expect(form.removePhone(0)).toHaveAttribute('mat-icon-button');
});

test('phone row primary renders as Material checkbox', async ({ page }) => {
  await seedLead(page);
  const form = new ContactFormPage(page);
  await form.goto();
  await form.addPhone().click();
  await expect(form.phoneRow(0).locator('mat-checkbox')).toBeVisible();
});
