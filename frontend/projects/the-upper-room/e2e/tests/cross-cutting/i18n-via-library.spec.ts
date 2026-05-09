// traces_to: L2-100
// Verifies TranslateService and TranslocoPipe from components library work after move
import { test, expect } from '@playwright/test';

test('en-CA translation renders after library move', async ({ page }) => {
  await page.goto('/styleguide');
  await expect(page.getByTestId('greeting')).toHaveText('Hello');
});

test('xx-XX fake locale renders after library move', async ({ page }) => {
  await page.goto('/styleguide?lang=xx-XX');
  await expect(page.getByTestId('greeting')).toHaveText('Bonjour-XX');
});

test('missing key falls back to key string after library move', async ({ page }) => {
  await page.goto('/styleguide');
  const result = await page.evaluate(() => {
    const win = window as unknown as { __translate?: { translate: (k: string) => string } };
    return win.__translate?.translate('nope.does-not-exist');
  });
  expect(result).toBe('nope.does-not-exist');
});
