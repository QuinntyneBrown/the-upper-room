// traces_to: L2-094
import { test, expect } from '@playwright/test';

test('five failed sign-in attempts triggers rate limit snackbar', async ({ page }) => {
  let callCount = 0;
  await page.route('**/api/v1/auth/sign-in', (route) => {
    callCount++;
    if (callCount > 5) {
      route.fulfill({
        status: 429,
        headers: { 'Retry-After': '1800' },
        contentType: 'application/json',
        body: JSON.stringify({ error: 'rate_limit_exceeded' }),
      });
    } else {
      route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'invalid_credentials' }) });
    }
  });

  await page.goto('/sign-in');

  for (let i = 0; i < 5; i++) {
    await page.getByTestId('email-field').fill('test@example.com');
    await page.getByTestId('password-field').fill('wrongpass');
    await page.getByTestId('sign-in-submit').click();
  }

  await expect(page.locator('tar-snackbar')).toContainText('Too many requests');
});
