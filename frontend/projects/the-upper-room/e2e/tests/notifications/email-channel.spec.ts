// traces_to: L2-063
import { test, expect, Page } from '@playwright/test';

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

test('dispatch welcome → email written with correct subject', async ({ page }) => {
  const mailEntry = {
    toUserId: 'member',
    subject: 'Welcome to The Upper Room!',
    body: "We're glad you're here. Take a quick tour to get started.",
    sentAt: new Date().toISOString(),
  };

  await page.route('**/api/v1/notifications/dispatch', (r) =>
    r.fulfill({ status: 204, body: '' }));

  await page.route('**/api/v1/notifications/test/sent-mail**', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([mailEntry]),
    }));

  await seedUser(page);

  const dispatchStatus = await page.evaluate(async (): Promise<number> => {
    const res = await fetch('/api/v1/notifications/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'welcome', recipientIds: ['member'] }),
    });
    return res.status;
  });
  expect(dispatchStatus).toBe(204);

  const mails = await page.evaluate(async (): Promise<{ subject: string }[]> => {
    const res = await fetch('/api/v1/notifications/test/sent-mail?toUserId=member');
    return res.json();
  });

  expect(mails).toHaveLength(1);
  expect(mails[0].subject).toBe('Welcome to The Upper Room!');
});
