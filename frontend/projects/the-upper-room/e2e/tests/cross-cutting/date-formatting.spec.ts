// traces_to: L2-110
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

test('5 minutes ago renders "5m ago"', async ({ page }) => {
  await seedUser(page);
  await page.goto('/date-formatting-test');
  await expect(page.getByTestId('relative-5m')).toHaveText('5m ago');
});

test('3 days ago renders "3d ago"', async ({ page }) => {
  await seedUser(page);
  await page.goto('/date-formatting-test');
  await expect(page.getByTestId('relative-3d')).toHaveText('3d ago');
});

test('8 days ago renders an absolute date', async ({ page }) => {
  await seedUser(page);
  await page.goto('/date-formatting-test');
  await expect(page.getByTestId('relative-8d')).toHaveText(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
});

test('numbers render with comma thousands separator', async ({ page }) => {
  await seedUser(page);
  await page.goto('/date-formatting-test');
  await expect(page.getByTestId('number-formatted')).toHaveText('1,234,567');
});
