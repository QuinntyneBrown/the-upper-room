// traces_to: L2-099
import { test, expect } from '@playwright/test';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { StyleguidePage } from '../../pages/StyleguidePage';

test.describe('confirm dialog', () => {
  test('info: confirm button is filled primary; resolves true', async ({ page }) => {
    const sg = new StyleguidePage(page);
    const dlg = new ConfirmDialog(page);
    await sg.goto();
    await sg.confirmTrigger('info').click();
    await expect(dlg.root()).toHaveAttribute('data-severity', 'info');
    await dlg.confirmButton().click();
    await expect(page.getByTestId('confirm-result')).toHaveText('true');
  });

  test('warning: severity attribute reflects warning', async ({ page }) => {
    const sg = new StyleguidePage(page);
    const dlg = new ConfirmDialog(page);
    await sg.goto();
    await sg.confirmTrigger('warning').click();
    await expect(dlg.root()).toHaveAttribute('data-severity', 'warning');
  });

  test('danger: typed confirmation gates the confirm button', async ({ page }) => {
    const sg = new StyleguidePage(page);
    const dlg = new ConfirmDialog(page);
    await sg.goto();
    await sg.confirmTrigger('danger-typed').click();
    await expect(dlg.confirmButton()).toBeDisabled();
    await dlg.typedInput().fill('delete');
    await expect(dlg.confirmButton()).toBeDisabled();
    await dlg.typedInput().fill('DELETE');
    await expect(dlg.confirmButton()).toBeEnabled();
  });

  test('Escape resolves false and closes', async ({ page }) => {
    const sg = new StyleguidePage(page);
    const dlg = new ConfirmDialog(page);
    await sg.goto();
    await sg.confirmTrigger('info').click();
    await page.keyboard.press('Escape');
    await expect(dlg.root()).toBeHidden();
    await expect(page.getByTestId('confirm-result')).toHaveText('false');
  });

  test('first focus is on the cancel button', async ({ page }) => {
    const sg = new StyleguidePage(page);
    const dlg = new ConfirmDialog(page);
    await sg.goto();
    await sg.confirmTrigger('info').click();
    await expect(dlg.cancelButton()).toBeFocused();
  });
});
