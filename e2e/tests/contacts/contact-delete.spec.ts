// traces_to: L2-033
import { test, expect } from '../../fixtures/test';
import { ContactDetailPage } from '../../pages/ContactDetailPage';
import { ConfirmDialog } from '../../components/ConfirmDialog';

const contact = {
  id: 'c1', name: 'Alice Smith', cityId: 'Toronto',
  title: 'Pastor', org: 'Grace Church',
  phones: [], emails: [], tags: [], archived: false,
};

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Contact:Create', 'Contact:Delete'] });
  });
}

test('typed confirmation requires exact display name — case-sensitive', async ({ page }) => {
  await page.route('**/api/v1/contacts/c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(contact) }),
  );
  await seedLead(page);
  const detail = new ContactDetailPage(page);
  await detail.goto('c1');
  await page.getByTestId('contact-delete-button').click();
  const dlg = new ConfirmDialog(page);
  await expect(dlg.root()).toBeVisible();
  const confirmInput = dlg.typedInput();
  await confirmInput.fill('alice smith');
  await expect(page.getByTestId('confirm-button')).toBeDisabled();
  await confirmInput.fill('Alice Smith');
  await expect(page.getByTestId('confirm-button')).toBeEnabled();
});

test('confirm delete → snackbar and redirect to contacts list', async ({ page }) => {
  await page.route('**/api/v1/contacts/c1', (route) => {
    if (route.request().method() === 'DELETE')
      return route.fulfill({ status: 204 });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(contact) });
  });
  await page.route(/\/api\/v1\/contacts(\?.*)?$/, (r) => {
    if (r.request().method() === 'GET')
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
    return r.fallback();
  });
  await seedLead(page);
  const detail = new ContactDetailPage(page);
  await detail.goto('c1');
  await page.getByTestId('contact-delete-button').click();
  const confirmInput = new ConfirmDialog(page).typedInput();
  await confirmInput.fill('Alice Smith');
  await page.getByTestId('confirm-button').click();
  await expect(page.getByTestId('snackbar')).toContainText('Contact deleted');
  await expect(page).toHaveURL(/\/contacts$/);
});
