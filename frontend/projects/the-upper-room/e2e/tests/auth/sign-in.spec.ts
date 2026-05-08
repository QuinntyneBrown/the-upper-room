// traces_to: L2-016
import { test, expect } from '@playwright/test';
import { SignInPage } from '../../pages/SignInPage';

test('valid credentials redirect to /dashboard', async ({ page }) => {
  const sp = new SignInPage(page);
  await sp.goto();
  await sp.submit('test@example.com', 'Password!23456');
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('empty email shows required error and prevents submit', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/v1/auth/**', async (route) => {
    calls += 1;
    await route.fulfill({ status: 200, body: '{}' });
  });
  const sp = new SignInPage(page);
  await sp.goto();
  await sp.submitButton().click();
  await expect(sp.errorFor('email')).toHaveText('Email is required');
  await expect(sp.emailInput()).toBeFocused();
  expect(calls).toBe(0);
});

test('wrong credentials show invalid-credentials message', async ({ page }) => {
  const sp = new SignInPage(page);
  await sp.goto();
  await sp.submit('test@example.com', 'wrong');
  await expect(sp.errorFor('form')).toHaveText('The email or password is incorrect.');
});

test('password visibility toggles between password and text', async ({ page }) => {
  const sp = new SignInPage(page);
  await sp.goto();
  await sp.passwordInput().fill('secret');
  await expect(sp.passwordInput()).toHaveAttribute('type', 'password');
  await sp.togglePasswordVisibility().click();
  await expect(sp.passwordInput()).toHaveAttribute('type', 'text');
  await sp.togglePasswordVisibility().click();
  await expect(sp.passwordInput()).toHaveAttribute('type', 'password');
});

test('XS layout: card is full-width minus 16px padding', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  const sp = new SignInPage(page);
  await sp.goto();
  const cardWidth = await sp.card().evaluate((el) => el.getBoundingClientRect().width);
  expect(cardWidth).toBeGreaterThanOrEqual(375 - 32 - 1);
  expect(cardWidth).toBeLessThanOrEqual(375 - 32 + 1);
});

test('MD layout: card max-width 400px', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  const sp = new SignInPage(page);
  await sp.goto();
  await expect(sp.card()).toHaveCSS('max-width', '400px');
});
