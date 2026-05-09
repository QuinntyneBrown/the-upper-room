// traces_to: L2-031
import { test, expect } from '@playwright/test';
import { ContactDetailPage } from '../../pages/ContactDetailPage';

const seedContact = {
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
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Contact:Create'] });
  });
}

test('edit button is a Material stroked button', async ({ page }) => {
  await page.route('**/api/v1/contacts/c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(seedContact) }),
  );
  await seedLead(page);
  const detail = new ContactDetailPage(page);
  await detail.goto('c1');
  await expect(detail.editButton()).toHaveAttribute('mat-stroked-button');
});

test('delete button is a Material flat button', async ({ page }) => {
  await page.route('**/api/v1/contacts/c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(seedContact) }),
  );
  await seedLead(page);
  const detail = new ContactDetailPage(page);
  await detail.goto('c1');
  await expect(page.getByTestId('contact-delete-button')).toHaveAttribute('mat-flat-button');
});

test('tab bar uses Material tab group', async ({ page }) => {
  await page.route('**/api/v1/contacts/c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(seedContact) }),
  );
  await seedLead(page);
  const detail = new ContactDetailPage(page);
  await detail.goto('c1');
  await expect(page.locator('mat-tab-group')).toBeVisible();
});
