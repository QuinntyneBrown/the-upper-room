// traces_to: L2-062
import { test, expect, Page } from '@playwright/test';
import { NotificationBell } from '../../components/NotificationBell';

const notifications = [
  { id: 'n1', code: 'event_created', title: 'Event', body: 'New event', data: null, read: false, createdAt: new Date().toISOString(), deepLink: null, severity: 'Info' },
];

async function seed(page: Page, items = notifications): Promise<void> {
  await page.route('**/api/v1/notifications', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items, total: items.length }) }),
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
}

test('bell button is a mat-icon-button', async ({ page }) => {
  await seed(page);
  await page.goto('/sign-in');
  const bell = new NotificationBell(page);
  await expect(bell.bell()).toHaveAttribute('mat-icon-button');
});

test('notification rows have mat-button attribute', async ({ page }) => {
  await seed(page);
  await page.goto('/sign-in');
  const bell = new NotificationBell(page);
  await bell.open();
  await expect(bell.rows().first()).toHaveAttribute('mat-button');
});

test('mark-all-read button is a mat-button', async ({ page }) => {
  await seed(page);
  await page.goto('/sign-in');
  const bell = new NotificationBell(page);
  await bell.open();
  await expect(bell.markAllRead()).toHaveAttribute('mat-button');
});

test('empty state icon is a mat-icon', async ({ page }) => {
  await seed(page, []);
  await page.goto('/sign-in');
  const bell = new NotificationBell(page);
  await bell.open();
  await expect(bell.emptyState()).toBeVisible();
  await expect(bell.emptyState().locator('mat-icon')).toBeVisible();
});

test('tab buttons preserve data-testid attributes', async ({ page }) => {
  await seed(page);
  await page.goto('/sign-in');
  const bell = new NotificationBell(page);
  await bell.open();
  await expect(bell.unreadTab()).toBeVisible();
  await expect(bell.allTab()).toBeVisible();
});
