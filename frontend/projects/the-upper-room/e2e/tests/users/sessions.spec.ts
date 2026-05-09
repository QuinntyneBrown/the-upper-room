// traces_to: L2-107
import { test, expect } from '@playwright/test';
import { MyProfilePage } from '../../pages/MyProfilePage';
import { SessionsCard } from '../../components/SessionsCard';
import { ConfirmDialog } from '../../components/ConfirmDialog';

const seedSessions = [
  { id: 's1', device: 'Chrome on Mac', location: 'Toronto, ON', lastSeen: '2026-05-08', current: true },
  { id: 's2', device: 'Safari on iPhone', location: 'Toronto, ON', lastSeen: '2026-05-07', current: false },
  { id: 's3', device: 'Edge on Windows', location: 'Halifax, NS', lastSeen: '2026-05-06', current: false },
];

async function seed(page: import('@playwright/test').Page) {
  await page.route('**/api/v1/users/me/profile', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        firstName: 'Alice', lastName: 'Brown', displayName: 'Alice', pronouns: '',
        title: '', city: 'Toronto', timezone: 'America/Toronto', locale: 'en-CA', avatarUrl: null,
      }),
    }),
  );
  await page.route('**/api/v1/users/me/sessions', (route) => {
    if (route.request().method() === 'GET')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: seedSessions }) });
    return route.continue();
  });
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[]; userId?: string }) => void;
    };
    win.__setTestToken?.('me');
    win.__setRbac?.({ roles: ['Member'], permissions: [], userId: 'me' });
  });
}

test('renders three rows; current session marked "This device"', async ({ page }) => {
  await seed(page);
  const profile = new MyProfilePage(page);
  const sessions = new SessionsCard(page);
  await profile.goto();
  await expect(sessions.rows()).toHaveCount(3);
  await expect(sessions.row('s1')).toContainText('This device');
  await expect(sessions.row('s2')).not.toContainText('This device');
});

test('Sign out others → confirm → snackbar "Signed out from 2 other devices"', async ({ page }) => {
  let revokeCalled = false;
  await seed(page);
  await page.route('**/api/v1/users/me/sessions/revoke-others', (route) => {
    revokeCalled = true;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ revoked: 2 }) });
  });
  const profile = new MyProfilePage(page);
  const sessions = new SessionsCard(page);
  const dlg = new ConfirmDialog(page);
  await profile.goto();
  await sessions.signOutOthers().click();
  await dlg.confirmButton().click();
  await expect.poll(() => revokeCalled).toBe(true);
  await expect(page.getByTestId('snackbar')).toContainText('Signed out from 2 other devices');
});
