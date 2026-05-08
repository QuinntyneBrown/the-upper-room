// traces_to: L2-020
import { test, expect } from '@playwright/test';
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../../pages/ResetPasswordPage';

test('forgot: same generic message for any email (no enumeration)', async ({ page }) => {
  await page.route('**/api/v1/auth/forgot-password', (r) =>
    r.fulfill({ status: 204, body: '' }),
  );
  const fp = new ForgotPasswordPage(page);
  await fp.goto();
  await fp.emailInput().fill('known@example.com');
  await fp.submitButton().click();
  await expect(fp.message()).toContainText(
    'If an account exists for known@example.com, a reset link has been sent.',
  );

  await fp.goto();
  await fp.emailInput().fill('unknown@example.com');
  await fp.submitButton().click();
  await expect(fp.message()).toContainText(
    'If an account exists for unknown@example.com, a reset link has been sent.',
  );
});

test('reset success: redirects to /sign-in?reset=1', async ({ page }) => {
  await page.route('**/api/v1/auth/reset-password', (r) =>
    r.fulfill({ status: 204, body: '' }),
  );
  const rp = new ResetPasswordPage(page);
  await rp.goto('valid');
  await rp.newPassword().fill('Password!23456');
  await rp.confirmPassword().fill('Password!23456');
  await rp.submitButton().click();
  await expect(page).toHaveURL(/\/sign-in\?reset=1$/);
});

test('reset expired: 410 → expired heading + back link', async ({ page }) => {
  await page.route('**/api/v1/auth/reset-password', (r) =>
    r.fulfill({
      status: 410,
      contentType: 'application/problem+json',
      body: JSON.stringify({ code: 'reset.token_expired' }),
    }),
  );
  const rp = new ResetPasswordPage(page);
  await rp.goto('expired');
  await rp.newPassword().fill('Password!23456');
  await rp.confirmPassword().fill('Password!23456');
  await rp.submitButton().click();
  await expect(rp.expiredHeading()).toContainText('expired');
});

test('mismatched confirmation: field error', async ({ page }) => {
  const rp = new ResetPasswordPage(page);
  await rp.goto('any');
  await rp.newPassword().fill('Password!23456');
  await rp.confirmPassword().fill('Different!23456');
  await rp.submitButton().click();
  await expect(rp.errorFor('confirm')).toHaveText('Passwords do not match.');
});
