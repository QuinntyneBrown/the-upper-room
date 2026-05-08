// traces_to: L2-007
import { test, expect } from '@playwright/test';
import { StyleguidePage } from '../../pages/StyleguidePage';

test.describe('iconography', () => {
  test('contacts alias resolves to the person glyph at default size 24px', async ({ page }) => {
    const sg = new StyleguidePage(page);
    await sg.goto();
    const icon = sg.iconByAlias('contacts');
    await expect(icon).toHaveText('person');
    await expect(icon).toHaveCSS('font-size', '24px');
    const family = await icon.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(family.toLowerCase()).toContain('material symbols rounded');
  });

  test('size="lg" resolves to 32px', async ({ page }) => {
    const sg = new StyleguidePage(page);
    await sg.goto();
    await expect(sg.iconByAlias('partners')).toHaveCSS('font-size', '32px');
  });

  test('icon retains its accessible label even with font blocked', async ({ page }) => {
    await page.route(/fonts\.googleapis\.com.*Material\+Symbols/, (r) => r.abort());
    const sg = new StyleguidePage(page);
    await sg.goto();
    await expect(sg.iconByAlias('contacts')).toHaveAttribute('aria-label', 'contacts');
  });
});
