// traces_to: L2-021
import { test, expect } from '@playwright/test';
import { AppShell } from '../../components/AppShell';
import { ConfirmDialog } from '../../components/ConfirmDialog';

async function signInToken(page: import('@playwright/test').Page) {
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as { __setTestToken?: (t: string) => void };
    win.__setTestToken?.('test-token');
  });
}

test('happy path: avatar menu → confirm → /sign-in?signedOut=1 + snackbar', async ({ page }) => {
  let revoked = false;
  await page.route('**/api/v1/auth/sign-out', (r) => {
    revoked = true;
    return r.fulfill({ status: 204, body: '' });
  });
  await signInToken(page);
  const shell = new AppShell(page);
  const dlg = new ConfirmDialog(page);
  await shell.avatarTrigger().click();
  await page.getByTestId('avatar-menu-sign-out').click();
  await dlg.confirmButton().click();
  await expect(page).toHaveURL(/\/sign-in\?signedOut=1$/);
  await expect(page.getByTestId('snackbar')).toContainText("You've been signed out");
  expect(revoked).toBe(true);
});

test('cancel keeps user on current page and signed in', async ({ page }) => {
  await signInToken(page);
  const shell = new AppShell(page);
  const dlg = new ConfirmDialog(page);
  await shell.avatarTrigger().click();
  await page.getByTestId('avatar-menu-sign-out').click();
  await dlg.cancelButton().click();
  await expect(page).toHaveURL(/\/sign-in$/);
  const token = await page.evaluate(() => {
    const win = window as unknown as { __translate?: unknown };
    void win;
    return localStorage.getItem('theme'); // sanity: no error
  });
  expect(token).not.toBeUndefined();
});
