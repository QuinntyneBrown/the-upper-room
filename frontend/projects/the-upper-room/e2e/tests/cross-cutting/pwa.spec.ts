// traces_to: L2-117, L2-116
import { test, expect } from '@playwright/test';

test('manifest returns correct name, short_name, display and start_url', async ({ page }) => {
  await page.goto('/');
  const manifest = await page.evaluate(async (): Promise<Record<string, unknown>> => {
    const r = await fetch('/manifest.webmanifest');
    return r.json();
  });

  expect(manifest['name']).toBe('The Upper Room');
  expect(manifest['short_name']).toBe('Upper Room');
  expect(manifest['display']).toBe('standalone');
  expect(manifest['start_url']).toBe('/dashboard');
});

test('service worker registers on first load', async ({ page }) => {
  await page.goto('/sign-in');
  await page.evaluate(() => navigator.serviceWorker.ready);

  const registered = await page.evaluate(async (): Promise<boolean> => {
    const reg = await navigator.serviceWorker.getRegistration('/');
    return !!reg;
  });
  expect(registered).toBe(true);
});

test('API responses are not cached by service worker', async ({ page }) => {
  let callCount = 0;
  await page.route('**/api/v1/health', (route) => {
    callCount++;
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok' }) });
  });

  await page.goto('/sign-in');
  await page.evaluate(() => fetch('/api/v1/health'));
  await page.evaluate(() => fetch('/api/v1/health'));

  expect(callCount).toBeGreaterThanOrEqual(2);
});
