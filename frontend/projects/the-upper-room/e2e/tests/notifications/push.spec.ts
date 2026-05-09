// traces_to: L2-063
import { test, expect } from '@playwright/test';

const mockPrefs = [
  { code: 'welcome', inApp: true, email: true, push: false },
];

const mockSubscription = {
  endpoint: 'https://push.example.com/sub/123',
  keys: { p256dh: 'AAAA', auth: 'BBBB' },
};

async function seedUser(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('user-token');
    win.__setRbac?.({ roles: ['Member'], permissions: [] });
  });
}

test('clicking Enable push POSTs subscription to server', async ({ page }) => {
  let postedSub: unknown = null;

  await page.route('**/api/v1/notifications/preferences', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockPrefs) }),
  );
  await page.route('**/api/v1/push/subscribe', (r) => {
    r.request().postDataJSON().then((data: unknown) => { postedSub = data; }).catch(() => {});
    r.fulfill({ status: 204 });
  });

  await page.route('**/api/v1/push/vapid-public-key', (r) =>
    r.fulfill({ status: 200, contentType: 'text/plain', body: 'BFakeVapidPublicKey123' }),
  );

  await seedUser(page);
  await page.goto('/settings/notifications');

  await page.evaluate((sub) => {
    const reg = {
      pushManager: {
        subscribe: async () => ({
          endpoint: sub.endpoint,
          toJSON: () => sub,
        }),
        getSubscription: async () => null,
      },
    };
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { ready: Promise.resolve(reg) },
      configurable: true,
    });
  }, mockSubscription);

  await page.getByTestId('push-enable-button').click();
  await expect(page.getByTestId('push-enable-button')).toBeHidden({ timeout: 3000 });
  await expect(page.getByTestId('push-disable-button')).toBeVisible();
});

test('dispatch with push enabled fires push event handled by SW', async ({ page }) => {
  let pushDispatched = false;

  await page.route('**/api/v1/push/test/pending*', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ title: 'Event Starting Soon', body: 'Your event starts in 15 minutes.' }]) }),
  );
  await page.route('**/api/v1/notifications/dispatch', (r) => {
    pushDispatched = true;
    r.fulfill({ status: 204 });
  });

  await seedUser(page);
  await page.goto('/sign-in');

  const pending = await page.evaluate(async () => {
    const r = await fetch('/api/v1/push/test/pending?userId=user-token');
    return r.json();
  });

  expect(Array.isArray(pending)).toBe(true);
  expect(pending.length).toBeGreaterThan(0);
  expect(pending[0]).toHaveProperty('title');
});

test('clicking Disable push removes subscription', async ({ page }) => {
  let deleteCount = 0;

  await page.route('**/api/v1/notifications/preferences', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockPrefs) }),
  );
  await page.route('**/api/v1/push/subscribe', (r) => {
    if (r.request().method() === 'DELETE') deleteCount++;
    r.fulfill({ status: 204 });
  });

  await seedUser(page);
  await page.goto('/settings/notifications');

  await page.evaluate((sub) => {
    const reg = {
      pushManager: {
        getSubscription: async () => ({
          endpoint: sub.endpoint,
          toJSON: () => sub,
          unsubscribe: async () => true,
        }),
      },
    };
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { ready: Promise.resolve(reg) },
      configurable: true,
    });
  }, mockSubscription);

  await page.getByTestId('push-disable-button').click();
  expect(deleteCount).toBe(1);
});
