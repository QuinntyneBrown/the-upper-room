// traces_to: L2-062
// Verifies TarNotificationBell and TarNotificationPreferences from domain library work after move
import { test, expect } from '@playwright/test';
import { NotificationBell } from '../../components/NotificationBell';

async function seedAuthUser(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('user-token');
    win.__setRbac?.({ roles: ['Member'], permissions: [] });
  });

  await page.route('/api/v1/notifications**', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'n1',
            code: 'welcome',
            title: 'Welcome',
            body: 'Welcome to The Upper Room!',
            data: null,
            read: false,
            createdAt: new Date().toISOString(),
            deepLink: null,
            severity: 'Info',
          },
        ],
        total: 1,
      }),
    });
  });

  await page.goto('/dashboard-stub');
}

test('notification bell renders in shell after library move', async ({ page }) => {
  await seedAuthUser(page);

  const bell = new NotificationBell(page);
  await expect(bell.bell()).toBeVisible();
});

test('unread badge count shows', async ({ page }) => {
  await seedAuthUser(page);

  const bell = new NotificationBell(page);
  await expect(bell.badge()).toBeVisible();
  await expect(bell.badge()).toContainText('1');
});

test('notification preferences page renders', async ({ page }) => {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('user-token');
    win.__setRbac?.({ roles: ['Member'], permissions: [] });
  });

  await page.route('/api/v1/notifications**', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ code: 'welcome', inApp: true, email: false, push: false }]),
    });
  });

  await page.goto('/settings/notifications');
  await expect(page.getByRole('heading', { name: 'Notification Preferences' })).toBeVisible();
});
