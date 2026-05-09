// traces_to: L2-022
import { test, expect } from '@playwright/test';
import { InactivityDialog } from '../../components/InactivityDialog';

test('after 30 min of idle, dialog appears with countdown 60', async ({ page }) => {
  await page.clock.install();
  await page.goto('/sign-in');
  await page.evaluate(() => {
    (window as unknown as { __setTestToken?: (t: string) => void }).__setTestToken?.('t');
  });
  await page.clock.fastForward(30 * 60 * 1000);
  const dlg = new InactivityDialog(page);
  await expect(dlg.root()).toBeVisible();
  await expect(dlg.countdown()).toHaveText('60');
});

test('Stay signed in dismisses the dialog', async ({ page }) => {
  await page.clock.install();
  await page.goto('/sign-in');
  await page.evaluate(() => {
    (window as unknown as { __setTestToken?: (t: string) => void }).__setTestToken?.('t');
  });
  await page.clock.fastForward(30 * 60 * 1000);
  const dlg = new InactivityDialog(page);
  await dlg.staySignedIn().click();
  await expect(dlg.root()).toBeHidden();
});

test('after another 60s with no interaction, redirects to /sign-in', async ({ page }) => {
  await page.clock.install();
  await page.route('**/api/v1/auth/sign-out', (r) => r.fulfill({ status: 204, body: '' }));
  await page.goto('/sign-in');
  await page.evaluate(() => {
    (window as unknown as { __setTestToken?: (t: string) => void }).__setTestToken?.('t');
  });
  await page.clock.fastForward(30 * 60 * 1000 + 61 * 1000);
  await expect(page).toHaveURL(/\/sign-in/);
});
