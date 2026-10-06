// traces_to: L2-019
import { test, expect } from '../../fixtures/test';
import { SignUpPage } from '../../pages/SignUpPage';
import { PasswordStrengthMeter } from '../../components/PasswordStrengthMeter';

test('common password is rejected with too-common helper', async ({ page }) => {
  const sp = new SignUpPage(page);
  const meter = new PasswordStrengthMeter(page);
  await sp.goto();
  await sp.passwordInput().fill('Password1!');
  await sp.passwordInput().blur();
  await expect(meter.helperText()).toContainText('Password is too common');
});

test('weak password fills fewer than 3 bars and shows Weak', async ({ page }) => {
  const sp = new SignUpPage(page);
  const meter = new PasswordStrengthMeter(page);
  await sp.goto();
  await sp.passwordInput().fill('aaaaaaaaaaaa');
  await sp.passwordInput().blur();
  expect(await meter.filledBars().count()).toBeLessThan(3);
  await expect(meter.label()).toHaveText('Weak');
});

test('strong 16-char password fills all 5 bars and shows Strong', async ({ page }) => {
  const sp = new SignUpPage(page);
  const meter = new PasswordStrengthMeter(page);
  await sp.goto();
  await sp.passwordInput().fill('Tr0ub4dor&3-Solid');
  await sp.passwordInput().blur();
  await expect(meter.filledBars()).toHaveCount(5);
  await expect(meter.label()).toHaveText('Strong');
});

test('password containing email local-part is rejected', async ({ page }) => {
  const sp = new SignUpPage(page);
  const meter = new PasswordStrengthMeter(page);
  await sp.goto();
  await sp.emailInput().fill('alice@example.com');
  await sp.passwordInput().fill('AliceSecret!23');
  await sp.passwordInput().blur();
  await expect(meter.helperText()).toContainText('may not contain your email or name');
});
