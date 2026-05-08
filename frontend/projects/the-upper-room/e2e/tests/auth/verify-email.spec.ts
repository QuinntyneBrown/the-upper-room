// traces_to: L2-018
import { test, expect } from '@playwright/test';
import { VerifyEmailPage } from '../../pages/VerifyEmailPage';

test('valid token: shows verified heading + Go-to-dashboard button', async ({ page }) => {
  await page.route('**/api/v1/auth/verify-email', (r) =>
    r.fulfill({ status: 204, body: '' }),
  );
  const vp = new VerifyEmailPage(page);
  await vp.confirm('valid');
  await expect(vp.verifiedHeading()).toContainText('Email verified');
  await expect(vp.goToDashboard()).toBeVisible();
});

test('expired token: shows expired heading + Send-a-new-link CTA', async ({ page }) => {
  await page.route('**/api/v1/auth/verify-email', (r) =>
    r.fulfill({
      status: 410,
      contentType: 'application/problem+json',
      body: JSON.stringify({ code: 'verify.token_expired' }),
    }),
  );
  const vp = new VerifyEmailPage(page);
  await vp.confirm('expired');
  await expect(vp.expiredHeading()).toContainText('Link expired');
  await expect(vp.sendNewLink()).toBeVisible();
});

test('resend within 60s: button disabled and cooldown shown', async ({ page }) => {
  await page.route('**/api/v1/auth/verify-email/resend', (r) =>
    r.fulfill({ status: 204, body: '' }),
  );
  const vp = new VerifyEmailPage(page);
  await vp.goto();
  await vp.resendButton().click();
  await expect(vp.resendButton()).toBeDisabled();
  await expect(vp.resendCooldown()).toContainText(/Please wait \d+s/);
});
