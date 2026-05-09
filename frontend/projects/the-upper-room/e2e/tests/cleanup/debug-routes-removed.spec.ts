// Traces to: TASK-0210
import { test, expect } from '@playwright/test';
import { NotFoundPage } from '../../pages/NotFoundPage';

const debugRoutes = ['/echo-test', '/__throw', '/__rbac-demo', '/date-formatting-test'];

for (const path of debugRoutes) {
  test(`debug route ${path} lands on the not-found page`, async ({ page }) => {
    await page.goto(path);
    const np = new NotFoundPage(page);
    await expect(np.heading()).toHaveText('Page not found');
    expect(new URL(page.url()).pathname).toBe(path);
  });
}
