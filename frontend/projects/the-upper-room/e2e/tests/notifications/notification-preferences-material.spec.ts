// traces_to: L2-064
import { test, expect, Page } from '@playwright/test';
import { NotificationPreferencesPage } from '../../pages/NotificationPreferencesPage';

interface PrefDto { code: string; inApp: boolean; email: boolean; push: boolean; }

function defaultPrefs(): PrefDto[] {
  return [
    { code: 'welcome', inApp: true, email: true, push: false },
    { code: 'event_created', inApp: true, email: false, push: false },
  ];
}

async function seed(page: Page): Promise<void> {
  await page.route('**/api/v1/notifications/preferences', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(defaultPrefs()) }),
  );
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('member-token');
    win.__setRbac?.({ roles: ['Member'], permissions: [] });
  });
  await page.route('/api/v1/notifications**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
}

test('notification table is a mat-table', async ({ page }) => {
  await seed(page);
  const prefPage = new NotificationPreferencesPage(page);
  await prefPage.goto();
  await expect(page.locator('table[mat-table]')).toBeVisible();
});

test('inApp toggle cell contains mat-checkbox', async ({ page }) => {
  await seed(page);
  const prefPage = new NotificationPreferencesPage(page);
  await prefPage.goto();
  const checkboxHost = prefPage.toggleHost('welcome', 'inApp');
  await expect(checkboxHost).toBeVisible();
  const tag = await checkboxHost.evaluate((el) => el.tagName.toLowerCase());
  expect(tag).toBe('mat-checkbox');
});

test('enable push button is a mat-stroked-button', async ({ page }) => {
  await seed(page);
  const prefPage = new NotificationPreferencesPage(page);
  await prefPage.goto();
  await expect(page.getByTestId('push-enable-button')).toHaveAttribute('mat-stroked-button');
});

test('pref row has data-testid preserving code', async ({ page }) => {
  await seed(page);
  const prefPage = new NotificationPreferencesPage(page);
  await prefPage.goto();
  await expect(prefPage.row('event_created')).toBeVisible();
});

test('email toggle checked state reflects pref data', async ({ page }) => {
  await seed(page);
  const prefPage = new NotificationPreferencesPage(page);
  await prefPage.goto();
  await expect(prefPage.toggle('welcome', 'email')).toBeChecked();
  await expect(prefPage.toggle('event_created', 'email')).not.toBeChecked();
});
