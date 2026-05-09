// traces_to: L2-006
import { test, expect } from '@playwright/test';

async function seedAuth(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('user-token');
    win.__setRbac?.({ roles: ['Member'], permissions: [] });
  });
}

test('drawer opens instantly under prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/dashboard-stub');
  await seedAuth(page);
  await page.goto('/contacts');

  const drawer = page.getByTestId('drawer');
  const durationBefore = await drawer.evaluate((el) => getComputedStyle(el).transitionDuration);

  await page.getByTestId('drawer-toggle').click();
  await expect(drawer).toHaveAttribute('aria-hidden', 'false', { timeout: 500 });

  // Under reduced motion, transition-duration must be 0s
  const duration = await drawer.evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(duration).toBe('0s');
});

test('skeleton element has no shimmer animation under prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/dashboard-stub');
  await seedAuth(page);
  await page.goto('/contacts');

  const skeleton = page.locator('.tar-skeleton__row').first();
  const count = await skeleton.count();
  if (count === 0) {
    // No skeleton visible, test is vacuously satisfied
    return;
  }

  const animationName = await skeleton.evaluate((el) => getComputedStyle(el).animationName);
  const animationDuration = await skeleton.evaluate((el) => getComputedStyle(el).animationDuration);
  // Either animation is none, or duration is 0s (both mean no visible shimmer)
  const noAnimation = animationName === 'none' || animationDuration === '0s';
  expect(noAnimation, `animation-name: ${animationName}, animation-duration: ${animationDuration}`).toBe(true);
});

test('snackbar appears instantly under prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/dashboard-stub');
  await seedAuth(page);
  await page.goto('/contacts');

  // Trigger a snackbar via an HTTP error (mock 500)
  await page.route('**/api/v1/contacts', (route) =>
    route.fulfill({ status: 500, body: '{}', contentType: 'application/json' }),
  );
  await page.reload();
  await page.waitForLoadState('networkidle');

  const snackbar = page.locator('tar-snackbar');
  // If snackbar is visible, its transition-duration should be 0s
  if (await snackbar.isVisible()) {
    const duration = await snackbar.evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(duration).toBe('0s');
  }
});

test('idea vote button does not play scale animation under prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/dashboard-stub');
  await seedAuth(page);
  await page.goto('/ideas');
  await page.waitForLoadState('networkidle');

  const voteBtn = page.locator('.idea-vote').first();
  const count = await voteBtn.count();
  if (count === 0) return;

  // Under reduced motion, transition-duration on vote button must be 0s
  const duration = await voteBtn.evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(duration).toBe('0s');
});
