// traces_to: L2-061
import { test, expect } from '@playwright/test';
import { Snackbar } from '../../components/Snackbar';
import { StyleguidePage } from '../../pages/StyleguidePage';

test.describe('snackbar', () => {
  test('info auto-dismisses after ~4000ms', async ({ page }) => {
    const sg = new StyleguidePage(page);
    const sb = new Snackbar(page);
    await sg.goto();
    await sg.snackbarTrigger('info').click();
    await expect(sb.root()).toBeVisible();
    await expect(sb.root()).toBeHidden({ timeout: 6000 });
  });

  test('error stays sticky past 10000ms', async ({ page }) => {
    const sg = new StyleguidePage(page);
    const sb = new Snackbar(page);
    await sg.goto();
    await sg.snackbarTrigger('error').click();
    await expect(sb.root()).toBeVisible();
    await page.waitForTimeout(10500);
    await expect(sb.root()).toBeVisible();
  });

  test('error has role=alert; info has role=status', async ({ page }) => {
    const sg = new StyleguidePage(page);
    const sb = new Snackbar(page);
    await sg.goto();
    await sg.snackbarTrigger('error').click();
    await expect(sb.root()).toHaveAttribute('role', 'alert');
    await sb.dismiss();
    await sg.snackbarTrigger('info').click();
    await expect(sb.root()).toHaveAttribute('role', 'status');
  });

  test('two queued snackbars play sequentially', async ({ page }) => {
    const sg = new StyleguidePage(page);
    const sb = new Snackbar(page);
    await sg.goto();
    await sg.snackbarTrigger('queue-pair').click();
    await expect(sb.message()).toHaveText('first');
    await sb.dismiss();
    await expect(sb.message()).toHaveText('second');
  });

  test('action "Undo" runs the handler and dismisses', async ({ page }) => {
    const sg = new StyleguidePage(page);
    const sb = new Snackbar(page);
    await sg.goto();
    await sg.snackbarTrigger('with-undo').click();
    await sb.actionButton().click();
    await expect(sb.root()).toBeHidden();
    await expect(page.getByTestId('undo-count')).toHaveText('1');
  });

  test('XS bottom-center, MD+ bottom-left', async ({ page }) => {
    const sg = new StyleguidePage(page);
    const sb = new Snackbar(page);
    await page.setViewportSize({ width: 375, height: 800 });
    await sg.goto();
    await sg.snackbarTrigger('info').click();
    await expect(sb.root()).toHaveClass(/snackbar--xs/);
    await sb.dismiss();
    await page.setViewportSize({ width: 1024, height: 800 });
    await sg.snackbarTrigger('info').click();
    await expect(sb.root()).toHaveCSS('left', '24px');
  });
});
