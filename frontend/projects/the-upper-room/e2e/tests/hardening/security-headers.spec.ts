// traces_to: L2-092
import { test, expect } from '@playwright/test';

test('API response contains Strict-Transport-Security header', async ({ page }) => {
  const [response] = await Promise.all([
    page.waitForResponse('**/api/v1/health'),
    page.evaluate(() => fetch('/api/v1/health')),
  ]);
  const hsts = response.headers()['strict-transport-security'];
  expect(hsts).toBeTruthy();
  expect(hsts).toContain('max-age=');
});

test('API response contains Content-Security-Policy header', async ({ page }) => {
  const [response] = await Promise.all([
    page.waitForResponse('**/api/v1/health'),
    page.evaluate(() => fetch('/api/v1/health')),
  ]);
  const csp = response.headers()['content-security-policy'];
  expect(csp).toBeTruthy();
  expect(csp).toContain('default-src');
});

test('API response contains X-Content-Type-Options nosniff', async ({ page }) => {
  const [response] = await Promise.all([
    page.waitForResponse('**/api/v1/health'),
    page.evaluate(() => fetch('/api/v1/health')),
  ]);
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
});
