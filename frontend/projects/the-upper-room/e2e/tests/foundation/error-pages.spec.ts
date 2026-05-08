// traces_to: L2-067, L2-068, L2-069
import { test, expect } from '@playwright/test';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { ForbiddenPage } from '../../pages/ForbiddenPage';
import { ErrorBoundaryPage } from '../../pages/ErrorBoundaryPage';

test('404: unknown route shows not-found page; URL preserved', async ({ page }) => {
  await page.goto('/no-such-route');
  const np = new NotFoundPage(page);
  await expect(np.heading()).toHaveText('Page not found');
  await expect(np.icon()).toHaveText('search_off');
  expect(new URL(page.url()).pathname).toBe('/no-such-route');
});

test('403: /forbidden shows forbidden page with dashboard CTA', async ({ page }) => {
  await page.goto('/forbidden');
  const fp = new ForbiddenPage(page);
  await expect(fp.icon()).toHaveText('block');
  await expect(fp.goToDashboard()).toHaveText('Go to dashboard');
});

test('500: /__throw renders the boundary with correlation id and reload', async ({ page }) => {
  await page.goto('/__throw');
  const eb = new ErrorBoundaryPage(page);
  await expect(eb.root()).toBeVisible();
  await expect(eb.correlationId()).not.toBeEmpty();
  await expect(eb.reloadButton()).toBeVisible();
});
