// traces_to: L2-008, L2-014
import { test, expect } from '@playwright/test';
import { StyleguidePage } from '../../pages/StyleguidePage';

const widths: { w: number; cols: number }[] = [
  { w: 375, cols: 1 },
  { w: 600, cols: 2 },
  { w: 800, cols: 3 },
  { w: 1100, cols: 4 },
  { w: 1300, cols: 6 },
];

test.describe('breakpoints + responsive grid', () => {
  for (const { w, cols } of widths) {
    test(`viewport ${w}px renders ${cols} grid column(s)`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 800 });
      const sg = new StyleguidePage(page);
      await sg.goto();
      const tracks = await sg.gridDemo().evaluate((el) => {
        return getComputedStyle(el).gridTemplateColumns.split(' ').length;
      });
      expect(tracks).toBe(cols);
    });
  }

  test('no horizontal scroll between 320px and 1920px', async ({ page }) => {
    const sg = new StyleguidePage(page);
    await sg.goto();
    for (const w of [320, 480, 600, 800, 1024, 1200, 1440, 1920]) {
      await page.setViewportSize({ width: w, height: 800 });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    }
  });
});
