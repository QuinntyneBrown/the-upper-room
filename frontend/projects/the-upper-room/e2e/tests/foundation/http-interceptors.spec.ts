// traces_to: L2-084, L2-066
import { test, expect } from '@playwright/test';
import { EchoTestPage } from '../../pages/EchoTestPage';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test('every request carries a UUID v4 X-Correlation-Id', async ({ page }) => {
  let captured: string | null = null;
  await page.route('**/api/v1/echo', async (route) => {
    captured = route.request().headers()['x-correlation-id'] ?? null;
    await route.fulfill({ status: 200, body: '{}' });
  });
  const echo = new EchoTestPage(page);
  await echo.goto();
  await echo.triggerSuccess();
  await expect.poll(() => captured).not.toBeNull();
  expect(captured).toMatch(UUID_V4);
});

test('GET retries on 503 and finally succeeds on the third attempt', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/v1/echo', async (route) => {
    attempts += 1;
    if (attempts < 3) await route.fulfill({ status: 503, body: '{}' });
    else await route.fulfill({ status: 200, body: '{"ok":true}' });
  });
  const echo = new EchoTestPage(page);
  await echo.goto();
  await echo.triggerRetry();
  await expect(echo.result()).toContainText('ok');
  expect(attempts).toBe(3);
});

test('POST is not retried on 503 and the failure surfaces once', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/v1/echo', async (route) => {
    attempts += 1;
    await route.fulfill({ status: 503, body: '{}' });
  });
  const echo = new EchoTestPage(page);
  await echo.goto();
  await echo.triggerPostFailure();
  await expect(echo.snackbar()).toBeVisible();
  expect(attempts).toBe(1);
});

test('400 problem-details with validation.email maps to catalog message', async ({ page }) => {
  await page.route('**/api/v1/echo', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/problem+json',
      body: JSON.stringify({ code: 'validation.email' }),
    });
  });
  const echo = new EchoTestPage(page);
  await echo.goto();
  await echo.triggerSuccess();
  await expect(echo.snackbar()).toContainText('Enter a valid email address');
});
