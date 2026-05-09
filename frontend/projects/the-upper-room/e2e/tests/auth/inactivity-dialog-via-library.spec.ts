// traces_to: L2-022
// Verifies IdleService and InactivityDialog from domain library work after move
import { test, expect } from '@playwright/test';
import { InactivityDialog } from '../../components/InactivityDialog';

async function seedAuth(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('user-token');
    win.__setRbac?.({ roles: ['Member'], permissions: [] });
  });
}

test('inactivity dialog appears when idle timer fires after library move', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/contacts');
  await page.waitForLoadState('networkidle');

  // Simulate idle by fast-forwarding all timers
  await page.evaluate(() => {
    const IDLE_MS = 30 * 60 * 1000;
    // Trigger a fake time passage by dispatching a synthetic tick
    // The IdleService uses setInterval(tick, 1000); we mock Date.now to simulate elapsed time
    const realNow = Date.now;
    (window as unknown as { _origDateNow: typeof Date.now })._origDateNow = realNow;
    Object.defineProperty(window, 'Date', {
      value: new Proxy(Date, {
        get(target, prop) {
          if (prop === 'now') return () => realNow() + IDLE_MS + 2000;
          return (target as unknown as Record<string | symbol, unknown>)[prop];
        },
      }),
      configurable: true,
    });
  });

  // Wait for the next tick (idle service checks every 1s)
  await page.waitForTimeout(1500);

  const dialog = new InactivityDialog(page);
  await expect(dialog.root()).toBeVisible({ timeout: 3000 });
});
