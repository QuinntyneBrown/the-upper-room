// traces_to: L2-015
import { test, expect } from '@playwright/test';
import { SignInPage } from '../../pages/SignInPage';
import { AuthCallbackPage } from '../../pages/AuthCallbackPage';

test('sign-in submit redirects to IdP authorize URL with PKCE params', async ({ page }) => {
  let location: URL | null = null;
  await page.route('**/__idp/authorize**', async (route) => {
    location = new URL(route.request().url());
    await route.fulfill({ status: 200, body: '' });
  });
  const sp = new SignInPage(page);
  await sp.goto();
  await sp.submit('test@example.com', 'Password!23456');
  await expect.poll(() => location?.searchParams.get('response_type')).toBe('code');
  expect(location!.searchParams.get('code_challenge_method')).toBe('S256');
  expect(location!.searchParams.get('state')).toBeTruthy();
  expect(location!.searchParams.get('nonce')).toBeTruthy();
  expect(location!.searchParams.get('code_challenge')).toBeTruthy();
});

test('callback with matching state POSTs /api/v1/auth/exchange and stores access in memory', async ({
  page,
}) => {
  let exchangeBody: { code?: string; codeVerifier?: string } | null = null;
  await page.route('**/api/v1/auth/exchange', async (route) => {
    exchangeBody = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ accessToken: 'real-access-token' }),
    });
  });
  await page.goto('/sign-in');
  await page.evaluate(() => {
    sessionStorage.setItem('pkce.state', 'state-abc');
    sessionStorage.setItem('pkce.verifier', 'verifier-xyz');
  });
  const cb = new AuthCallbackPage(page);
  await cb.gotoWithCode('auth-code-123', 'state-abc');
  await expect.poll(() => exchangeBody?.code).toBe('auth-code-123');
  expect(exchangeBody!.codeVerifier).toBe('verifier-xyz');
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('callback with mismatched state shows error snackbar and lands at /sign-in', async ({
  page,
}) => {
  await page.goto('/sign-in');
  await page.evaluate(() => {
    sessionStorage.setItem('pkce.state', 'expected');
  });
  const cb = new AuthCallbackPage(page);
  await cb.gotoWithCode('any', 'wrong-state');
  await expect(page.getByTestId('snackbar')).toContainText('Sign-in failed');
  await expect(page).toHaveURL(/\/sign-in$/);
});

test('no JWT-like values are written to localStorage or sessionStorage', async ({ page }) => {
  await page.goto('/sign-in');
  const blobs = await page.evaluate(() => {
    const entries: string[] = [];
    for (let i = 0; i < localStorage.length; i++) entries.push(localStorage.getItem(localStorage.key(i)!) ?? '');
    for (let i = 0; i < sessionStorage.length; i++) entries.push(sessionStorage.getItem(sessionStorage.key(i)!) ?? '');
    return entries;
  });
  for (const v of blobs) expect(v.startsWith('eyJ')).toBe(false);
});
