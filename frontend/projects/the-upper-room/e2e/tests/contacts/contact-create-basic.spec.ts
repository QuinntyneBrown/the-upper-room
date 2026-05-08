// traces_to: L2-032, L2-029
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

async function seedMember(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('member-token');
    win.__setRbac?.({ roles: ['Member'], permissions: [] });
  });
}

test('submit Alice Smith → redirect to detail; success snackbar', async ({ page }) => {
  let postedBody: unknown = null;
  await page.route('**/api/v1/contacts', (route) => {
    if (route.request().method() === 'POST') {
      postedBody = JSON.parse(route.request().postData() ?? '{}');
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'new1', name: 'Alice Smith', cityId: 'Toronto' }) });
    }
    return route.continue();
  });
  await seedLead(page);
  const form = new ContactFormPage(page);
  await form.goto();
  await form.firstName().fill('Alice');
  await form.lastName().fill('Smith');
  await form.submit().click();
  await expect(page).toHaveURL(/\/contacts\/new1/);
  await expect(page.getByTestId('snackbar')).toContainText('Contact created');
});

test('empty firstName → error shown and focus moves to firstName', async ({ page }) => {
  await seedLead(page);
  const form = new ContactFormPage(page);
  await form.goto();
  await form.submit().click();
  await expect(form.firstNameError()).toContainText('First name is required');
  await expect(form.firstName()).toBeFocused();
});

test('cancel with dirty form → "Discard changes?" dialog', async ({ page }) => {
  await seedLead(page);
  const form = new ContactFormPage(page);
  await form.goto();
  await form.firstName().fill('Temp');
  await form.cancel().click();
  await expect(page.getByTestId('confirm-dialog')).toBeVisible();
  await expect(page.getByTestId('confirm-dialog')).toContainText('Discard changes?');
});

test('unsaved indicator dot appears once any field changes', async ({ page }) => {
  await seedLead(page);
  const form = new ContactFormPage(page);
  await form.goto();
  await expect(form.unsavedDot()).toBeHidden();
  await form.firstName().fill('A');
  await expect(form.unsavedDot()).toBeVisible();
});

test('Member without Contact:Create redirected to /forbidden', async ({ page }) => {
  await seedMember(page);
  const form = new ContactFormPage(page);
  await form.goto();
  await expect(page).toHaveURL(/\/forbidden/);
});
