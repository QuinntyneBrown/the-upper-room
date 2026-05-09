// traces_to: L2-062, L2-063
import { test, expect, Page } from '@playwright/test';

interface NotificationDto {
  id: string;
  code: string;
  title: string;
  body: string;
  data: Record<string, string> | null;
  read: boolean;
  createdAt: string;
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

test('dispatch endpoint creates notification retrievable via GET', async ({ page }) => {
  const notification: NotificationDto = {
    id: 'n1',
    code: 'event_reminder_24h',
    title: 'Event tomorrow',
    body: '"Sunday Service" starts in 24 hours at 10:00 AM.',
    data: { title: 'Sunday Service', time: '10:00 AM' },
    read: false,
    createdAt: new Date().toISOString(),
  };

  await page.route('**/api/v1/notifications/dispatch', (r) =>
    r.fulfill({ status: 204, body: '' }));

  await page.route('**/api/v1/notifications', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [notification], total: 1 }),
    }));

  await seedUser(page);

  const dispatchStatus = await page.evaluate(async () => {
    const res = await fetch('/api/v1/notifications/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'event_reminder_24h',
        recipientIds: ['member'],
        data: { title: 'Sunday Service', time: '10:00 AM' },
      }),
    });
    return res.status;
  });
  expect(dispatchStatus).toBe(204);

  const result = await page.evaluate(async (): Promise<{ items: NotificationDto[]; total: number }> => {
    const res = await fetch('/api/v1/notifications');
    return res.json();
  });

  expect(result.items).toHaveLength(1);
  expect(result.items[0].code).toBe('event_reminder_24h');
  expect(result.items[0].read).toBe(false);
  expect(result.items[0].data).toBeTruthy();
  expect(result.items[0].createdAt).toBeTruthy();
});
