// traces_to: L2-001, L2-002, L2-003, L2-005, L2-006
import { test, expect } from '@playwright/test';
import { StyleguidePage } from '../../pages/StyleguidePage';

test.describe('design tokens', () => {
  test('button uses full corner radius (9999px)', async ({ page }) => {
    const sg = new StyleguidePage(page);
    await sg.goto();
    await expect(sg.seedButton).toHaveCSS('border-radius', '9999px');
  });

  test('card uses medium corner radius (12px) and 16px padding at XS', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const sg = new StyleguidePage(page);
    await sg.goto();
    await expect(sg.seedCard).toHaveCSS('border-radius', '12px');
    await expect(sg.seedCard).toHaveCSS('padding', '16px');
  });

  test('body-medium typography is Roboto 14/20', async ({ page }) => {
    const sg = new StyleguidePage(page);
    await sg.goto();
    await expect(sg.seedChip).toHaveCSS('font-size', '14px');
    await expect(sg.seedChip).toHaveCSS('line-height', '20px');
    const family = await sg.seedChip.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(family.toLowerCase()).toContain('roboto');
  });

  test('--md-sys-color-primary is set in light and changes in dark', async ({ page }) => {
    const sg = new StyleguidePage(page);
    await sg.goto();
    const light = await sg.cssVar('--md-sys-color-primary');
    expect(light).toMatch(/^#[0-9a-fA-F]{3,8}$/);
    await sg.setTheme('dark');
    const dark = await sg.cssVar('--md-sys-color-primary');
    expect(dark).toMatch(/^#[0-9a-fA-F]{3,8}$/);
    expect(dark).not.toBe(light);
  });

  test('reduced motion forces transition-duration to 0ms', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const sg = new StyleguidePage(page);
    await sg.goto();
    await expect(sg.seedButton).toHaveCSS('transition-duration', '0s');
    await ctx.close();
  });
});
