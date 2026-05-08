// traces_to: L2-103, L2-104, L2-105
import { test, expect } from '@playwright/test';
import { StyleguidePage } from '../../pages/StyleguidePage';

test.describe('state components', () => {
  test('empty state: xl icon, headline-small heading, body capped 360px', async ({ page }) => {
    const sg = new StyleguidePage(page);
    await sg.goto();
    const empty = sg.emptyDemo();
    const heading = empty.locator('[data-testid="empty-heading"]');
    const body = empty.locator('[data-testid="empty-body"]');
    const icon = empty.locator('[data-testid="icon-info"]');
    await expect(icon).toHaveCSS('font-size', '40px');
    await expect(heading).toHaveCSS('font-size', '24px');
    await expect(body).toHaveCSS('font-size', '14px');
    await expect(body).toHaveCSS('max-width', '360px');
  });

  test('skeleton: N rectangles, no shimmer animation under reduced-motion', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const sg = new StyleguidePage(page);
    await sg.goto();
    const rects = sg.skeletonDemo().locator('.skeleton__row');
    await expect(rects).toHaveCount(5);
    const duration = await rects.first().evaluate((el) => getComputedStyle(el).animationDuration);
    expect(duration).toBe('0s');
    await ctx.close();
  });

  test('list error: heading + correlation id + Try again invokes callback', async ({ page }) => {
    const sg = new StyleguidePage(page);
    await sg.goto();
    const error = sg.errorDemo();
    await expect(error.locator('[data-testid="error-heading"]')).toHaveText(
      "We couldn't load this",
    );
    await expect(error.locator('[data-testid="error-body"]')).toContainText('test-correlation');
    await error.locator('[data-testid="error-retry"]').click();
    await expect(page.getByTestId('error-retry-count')).toHaveText('1');
  });
});
