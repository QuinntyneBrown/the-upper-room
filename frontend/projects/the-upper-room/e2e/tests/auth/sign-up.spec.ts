// traces_to: L2-017
import { test, expect } from '@playwright/test';
import { SignUpPage } from '../../pages/SignUpPage';

test('happy path: fill, submit, redirect to /verify-email + welcome snackbar', async ({ page }) => {
  await page.route('**/api/v1/auth/sign-up', (r) =>
    r.fulfill({ status: 201, contentType: 'application/json', body: '{}' }),
  );
  const sp = new SignUpPage(page);
  await sp.goto();
  await sp.emailInput().fill('new@example.com');
  await sp.passwordInput().fill('Password!23456');
  await sp.cityInput().fill('Toronto');
  await sp.termsCheckbox().check();
  await sp.submitButton().click();
  await expect(page).toHaveURL(/\/verify-email$/);
  await expect(page.getByTestId('snackbar')).toContainText('Account created');
});

test('duplicate email: 409 shows inline error with sign-in link', async ({ page }) => {
  await page.route('**/api/v1/auth/sign-up', (r) =>
    r.fulfill({
      status: 409,
      contentType: 'application/problem+json',
      body: JSON.stringify({ code: 'validation.duplicate' }),
    }),
  );
  const sp = new SignUpPage(page);
  await sp.goto();
  await sp.emailInput().fill('dup@example.com');
  await sp.passwordInput().fill('Password!23456');
  await sp.cityInput().fill('Toronto');
  await sp.termsCheckbox().check();
  await sp.submitButton().click();
  await expect(sp.errorFor('email')).toContainText('already exists');
  await expect(sp.signInLink()).toHaveAttribute('href', '/sign-in');
});

test('submit is disabled until all fields valid AND terms checked', async ({ page }) => {
  const sp = new SignUpPage(page);
  await sp.goto();
  await expect(sp.submitButton()).toBeDisabled();
  await sp.emailInput().fill('a@b.co');
  await sp.passwordInput().fill('Password!23456');
  await sp.cityInput().fill('Toronto');
  await expect(sp.submitButton()).toBeDisabled();
  await sp.termsCheckbox().check();
  await expect(sp.submitButton()).toBeEnabled();
});

test('invitation: ?token=valid pre-fills email + city as read-only', async ({ page }) => {
  await page.route('**/api/v1/invitations?token=valid', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ email: 'invitee@example.com', city: 'Halifax' }),
    }),
  );
  const sp = new SignUpPage(page);
  await sp.gotoInvitation('valid');
  await expect(sp.emailInput()).toHaveValue('invitee@example.com');
  await expect(sp.cityInput()).toHaveValue('Halifax');
  await expect(sp.emailInput()).toHaveAttribute('readonly', '');
  await expect(sp.cityInput()).toHaveAttribute('readonly', '');
});

test('invitation: ?token=expired shows expiry card with request-new CTA', async ({ page }) => {
  await page.route('**/api/v1/invitations?token=expired', (r) =>
    r.fulfill({
      status: 410,
      contentType: 'application/problem+json',
      body: JSON.stringify({ code: 'invitation.expired' }),
    }),
  );
  const sp = new SignUpPage(page);
  await sp.gotoInvitation('expired');
  await expect(sp.expiredCard()).toContainText('expired');
  await expect(sp.requestNewInvite()).toBeVisible();
});
