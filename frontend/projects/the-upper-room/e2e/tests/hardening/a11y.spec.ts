// traces_to: L2-085, L2-086, L2-087, L2-088
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function seedAuth(page: Page): Promise<void> {
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('user-token');
    win.__setRbac?.({ roles: ['Member'], permissions: ['Contact:Create'] });
  });
}

async function runA11y(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  return results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
}

const publicRoutes = ['/sign-in'];

const protectedRoutes = [
  '/contacts',
  '/partners',
  '/boards',
  '/ideas',
  '/locations',
  '/profile',
];

for (const route of publicRoutes) {
  test(`axe: zero serious/critical violations on ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    const violations = await runA11y(page);
    expect(violations, JSON.stringify(violations.map((v) => ({ id: v.id, nodes: v.nodes.length })))).toHaveLength(0);
  });
}

for (const route of protectedRoutes) {
  test(`axe: zero serious/critical violations on ${route}`, async ({ page }) => {
    await page.goto('/dashboard-stub');
    await seedAuth(page);
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    const violations = await runA11y(page);
    expect(violations, JSON.stringify(violations.map((v) => ({ id: v.id, nodes: v.nodes.length })))).toHaveLength(0);
  });
}

test('skip-to-content is the first focusable element on shell pages', async ({ page }) => {
  await page.goto('/dashboard-stub');
  await seedAuth(page);
  await page.goto('/contacts');
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  expect(focused).toBe('skip-link');
});

test('activating skip-to-content link lands focus on <main>', async ({ page }) => {
  await page.goto('/dashboard-stub');
  await seedAuth(page);
  await page.goto('/contacts');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  const focused = await page.evaluate(() => document.activeElement?.id);
  expect(focused).toBe('main');
});

test('confirm-dialog: Esc closes dialog', async ({ page }) => {
  await page.goto('/dashboard-stub');
  await seedAuth(page);
  await page.goto('/contacts');
  await page.waitForLoadState('networkidle');

  await page.evaluate(() => {
    const win = window as unknown as { __openConfirmDialog?: (o: object) => Promise<boolean> };
    win.__openConfirmDialog?.({ title: 'Test dialog', body: 'Press Esc to dismiss' });
  });

  const dialog = page.getByTestId('confirm-dialog');
  await expect(dialog).toBeVisible({ timeout: 2000 });
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('confirm-dialog: Tab wraps within dialog focusable elements', async ({ page }) => {
  await page.goto('/dashboard-stub');
  await seedAuth(page);
  await page.goto('/contacts');
  await page.waitForLoadState('networkidle');

  await page.evaluate(() => {
    const win = window as unknown as { __openConfirmDialog?: (o: object) => Promise<boolean> };
    win.__openConfirmDialog?.({ title: 'Tab focus trap', body: 'Tab should stay inside' });
  });

  const dialog = page.getByTestId('confirm-dialog');
  await expect(dialog).toBeVisible({ timeout: 2000 });

  const cancel = page.getByTestId('confirm-cancel');
  const confirm = page.getByTestId('confirm-button');
  await cancel.focus();

  // Tab from cancel should go to confirm
  await page.keyboard.press('Tab');
  const afterFirst = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  expect(afterFirst).toBe('confirm-button');

  // Tab from confirm should wrap back to cancel (focus trap)
  await confirm.focus();
  await page.keyboard.press('Tab');
  const afterWrap = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  expect(afterWrap).toBe('confirm-cancel');
});
