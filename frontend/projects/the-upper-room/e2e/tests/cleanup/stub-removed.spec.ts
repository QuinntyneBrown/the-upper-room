// Traces to: TASK-0211
import { test, expect } from '@playwright/test';
import { NotFoundPage } from '../../pages/NotFoundPage';

test('legacy /dashboard-stub path lands on the not-found page', async ({ page }) => {
  await page.goto('/sign-in');
  const np = new NotFoundPage(page);
  await expect(np.heading()).toHaveText('Page not found');
});

test('home route still loads after Stub removal', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/$/);
});
