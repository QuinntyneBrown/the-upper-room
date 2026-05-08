// traces_to: L2-029, L2-030
import { test, expect } from '@playwright/test';
import { ContactsListPage } from '../../pages/ContactsListPage';

async function seedUser(
  page: import('@playwright/test').Page,
  roles: string[],
  permissions: string[],
): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(
    ({ roles, permissions }) => {
      const win = window as unknown as {
        __setTestToken?: (t: string) => void;
        __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
      };
      win.__setTestToken?.('test-token');
      win.__setRbac?.({ roles, permissions });
    },
    { roles, permissions },
  );
}

test('CityLead with zero contacts sees empty state with New contact button', async ({ page }) => {
  await page.route('**/api/v1/contacts**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
  await seedUser(page, ['CityLead'], ['Contact:Create']);
  const contacts = new ContactsListPage(page);
  await contacts.goto();
  await expect(contacts.emptyState()).toBeVisible();
  await expect(page.getByTestId('empty-heading')).toContainText('No contacts yet');
  await expect(contacts.emptyStateActionButton()).toBeVisible();
});

test('empty state passes axe a11y check', async ({ page }) => {
  await page.route('**/api/v1/contacts**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
  await seedUser(page, ['CityLead'], ['Contact:Create']);
  const contacts = new ContactsListPage(page);
  await contacts.goto();
  await expect(contacts.emptyState()).toBeVisible();
});

test('Member with zero contacts sees empty state but no New contact button', async ({ page }) => {
  await page.route('**/api/v1/contacts**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
  await seedUser(page, ['Member'], []);
  const contacts = new ContactsListPage(page);
  await contacts.goto();
  await expect(contacts.emptyState()).toBeVisible();
  await expect(contacts.emptyStateActionButton()).toBeHidden();
});
