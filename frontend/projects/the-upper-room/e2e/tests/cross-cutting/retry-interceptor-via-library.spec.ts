// traces_to: L2-084
// Verifies retryInterceptor from components library works after move
import { test, expect } from '@playwright/test';

async function seedAuth(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('user-token');
    win.__setRbac?.({ roles: ['Member'], permissions: [] });
  });
}

test('GET retries on 503 and succeeds on third attempt after library move', async ({ page }) => {
  await seedAuth(page);

  let callCount = 0;
  await page.route('/api/contacts**', (route) => {
    callCount++;
    if (callCount <= 2) {
      void route.fulfill({ status: 503, body: 'Service Unavailable' });
    } else {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], totalCount: 0 }) });
    }
  });

  await page.goto('/contacts');
  await page.waitForLoadState('networkidle');

  // App should load without showing an error (retry succeeded)
  await expect(page.getByTestId('list-error')).not.toBeVisible();
  expect(callCount).toBeGreaterThanOrEqual(3);
});
