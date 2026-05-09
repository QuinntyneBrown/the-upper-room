// traces_to: L2-062
import { test, expect, Page } from '@playwright/test';
import { NotificationBell } from '../../components/NotificationBell';

interface NotificationDto {
  id: string;
  code: string;
  title: string;
  body: string;
  data: Record<string, string> | null;
  read: boolean;
  createdAt: string;
  deepLink?: string | null;
  severity?: string;
}

async function seedUser(page: Page): Promise<void> {
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

test('zero unread: no badge, empty state shown', async ({ page }) => {
  await page.route('**/api/v1/notifications', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], total: 0 }),
    }));

  await seedUser(page);
  await page.goto('/dashboard-stub');

  const bell = new NotificationBell(page);
  await expect(bell.badge()).toBeHidden();

  await bell.open();
  await expect(bell.menu()).toBeVisible();
  await expect(bell.emptyState()).toBeVisible();
  await expect(bell.emptyState()).toContainText("You're all caught up");
});

test('dispatch notification → badge shows 1, menu lists row', async ({ page }) => {
  const notification: NotificationDto = {
    id: 'n1',
    code: 'event_reminder_24h',
    title: 'Event tomorrow',
    body: '"Sunday Service" starts in 24 hours at 10:00 AM.',
    data: { title: 'Sunday Service', time: '10:00 AM' },
    read: false,
    createdAt: new Date().toISOString(),
    deepLink: null,
    severity: 'Info',
  };

  await page.route('**/api/v1/notifications', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [notification], total: 1 }),
    }));

  await seedUser(page);
  await page.goto('/dashboard-stub');

  const bell = new NotificationBell(page);
  await expect(bell.badge()).toBeVisible();
  await expect(bell.badge()).toContainText('1');

  await bell.open();
  await expect(bell.rows()).toHaveCount(1);
  await expect(bell.row(0)).toContainText('Event tomorrow');
});

test('click row marks read, badge decrements, navigates to deep link', async ({ page }) => {
  const notification: NotificationDto = {
    id: 'n2',
    code: 'idea_status_changed',
    title: 'Idea status changed',
    body: '"My Idea" moved to InProgress.',
    data: null,
    read: false,
    createdAt: new Date().toISOString(),
    deepLink: '/ideas/idea-1',
    severity: 'Info',
  };

  let readCalled = false;
  await page.route('**/api/v1/notifications', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: readCalled ? [] : [notification], total: readCalled ? 0 : 1 }),
    }));

  await page.route('**/api/v1/notifications/n2/read', (r) => {
    readCalled = true;
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...notification, read: true }) });
  });

  await seedUser(page);
  await page.goto('/dashboard-stub');

  const bell = new NotificationBell(page);
  await bell.open();
  await bell.row(0).click();

  await expect(bell.badge()).toBeHidden();
  await expect(page).toHaveURL(/\/ideas\/idea-1/);
});

test('"Mark all as read" clears badge, rows still listed under All tab', async ({ page }) => {
  const notifications: NotificationDto[] = [
    {
      id: 'n3',
      code: 'welcome',
      title: 'Welcome',
      body: 'Welcome to The Upper Room!',
      data: null,
      read: false,
      createdAt: new Date().toISOString(),
      deepLink: null,
      severity: 'Info',
    },
  ];

  let allRead = false;
  await page.route('**/api/v1/notifications/read-all', (r) => {
    allRead = true;
    r.fulfill({ status: 204, body: '' });
  });

  await page.route('**/api/v1/notifications', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: notifications.map((n) => ({ ...n, read: allRead || n.read })),
        total: notifications.length,
      }),
    }));

  await seedUser(page);
  await page.goto('/dashboard-stub');

  const bell = new NotificationBell(page);
  await expect(bell.badge()).toBeVisible();

  await bell.open();
  await bell.markAllRead().click();

  await expect(bell.badge()).toBeHidden();

  await bell.allTab().click();
  await expect(bell.rows()).toHaveCount(1);
});
