// traces_to: L2-100, L2-110
import { test, expect } from '@playwright/test';

test('greeting renders the en-CA translation by default', async ({ page }) => {
  await page.goto('/styleguide');
  await expect(page.getByTestId('greeting')).toHaveText('Hello');
});

test('switching locale via ?lang=xx-XX renders the fake translation', async ({ page }) => {
  await page.goto('/styleguide?lang=xx-XX');
  await expect(page.getByTestId('greeting')).toHaveText('Bonjour-XX');
});

test('missing key falls back to the key string', async ({ page }) => {
  await page.goto('/styleguide');
  const result = await page.evaluate(() => {
    const win = window as unknown as { __translate?: { translate: (k: string) => string } };
    return win.__translate?.translate('nope.does-not-exist');
  });
  expect(result).toBe('nope.does-not-exist');
});
