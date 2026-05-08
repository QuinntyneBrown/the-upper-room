// traces_to: L2-102
import { describe, it, expect } from 'vitest';
import { check } from '../lib/playwright-no-raw-locators.js';

describe('playwright-no-raw-locators', () => {
  it('passes when spec uses POM methods', () => {
    const src = `await page.goto('/'); await new LandingPage(page).appName.click();`;
    expect(check('e2e/tests/foo.spec.ts', src)).toEqual([]);
  });

  it('flags page.locator in spec', () => {
    const src = `await page.locator('h1').click();`;
    expect(check('e2e/tests/foo.spec.ts', src).length).toBeGreaterThan(0);
  });

  it('flags page.getByRole in spec', () => {
    const src = `await page.getByRole('button').click();`;
    expect(check('e2e/tests/foo.spec.ts', src).length).toBeGreaterThan(0);
  });

  it('ignores raw locators in POM files', () => {
    const src = `this.appName = page.getByRole('heading');`;
    expect(check('e2e/pages/LandingPage.ts', src)).toEqual([]);
  });
});
