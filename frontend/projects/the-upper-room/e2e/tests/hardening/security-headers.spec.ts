// traces_to: L2-092
import { test, expect } from '@playwright/test';

test('GET / response contains Strict-Transport-Security header', async ({ page }) => {
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/') || r.url().match(/localhost:\d+\/$/) !== null),
    page.goto('/'),
  ]);
  const hsts = response.headers()['strict-transport-security'];
  expect(hsts).toBeTruthy();
  expect(hsts).toContain('max-age=');
});

test('GET / response contains Content-Security-Policy header', async ({ page }) => {
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/') || r.url().match(/localhost:\d+\/$/) !== null),
    page.goto('/'),
  ]);
  const csp = response.headers()['content-security-policy'];
  expect(csp).toBeTruthy();
  expect(csp).toContain('default-src');
});

test('GET / response contains X-Content-Type-Options header', async ({ page }) => {
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/') || r.url().match(/localhost:\d+\/$/) !== null),
    page.goto('/'),
  ]);
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
});
