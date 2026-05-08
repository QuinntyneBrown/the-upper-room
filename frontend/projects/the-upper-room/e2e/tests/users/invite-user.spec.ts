// traces_to: L2-027
import { test, expect } from '@playwright/test';
import { UserListPage } from '../../pages/UserListPage';
import { InviteUserDialog } from '../../components/InviteUserDialog';

async function seedAdmin(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('admin');
    win.__setRbac?.({ roles: ['SystemAdmin'], permissions: ['User:Manage'] });
  });
}

test('valid invite: dialog closes; snackbar with Undo', async ({ page }) => {
  await page.route('**/api/v1/users**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
  await page.route('**/api/v1/invitations', (route) => {
    if (route.request().method() === 'POST')
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'inv1' }) });
    return route.continue();
  });
  await seedAdmin(page);
  const list = new UserListPage(page);
  const dlg = new InviteUserDialog(page);
  await list.goto();
  await list.inviteButton().click();
  await dlg.email().fill('alice@example.com');
  await dlg.firstName().fill('Alice');
  await dlg.lastName().fill('Brown');
  await dlg.city().fill('Toronto');
  await dlg.submit().click();
  await expect(dlg.root()).toBeHidden();
  await expect(page.getByTestId('snackbar')).toContainText('Invitation sent to alice@example.com');
  await expect(page.getByTestId('snackbar-action')).toHaveText('Undo');
});

test('Undo within 10s revokes invitation', async ({ page }) => {
  let revoked = false;
  await page.route('**/api/v1/users**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
  await page.route('**/api/v1/invitations', (route) => {
    if (route.request().method() === 'POST')
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'inv1' }) });
    return route.continue();
  });
  await page.route('**/api/v1/invitations/inv1', (route) => {
    if (route.request().method() === 'DELETE') {
      revoked = true;
      return route.fulfill({ status: 204, body: '' });
    }
    return route.continue();
  });
  await seedAdmin(page);
  const list = new UserListPage(page);
  const dlg = new InviteUserDialog(page);
  await list.goto();
  await list.inviteButton().click();
  await dlg.email().fill('alice@example.com');
  await dlg.firstName().fill('Alice');
  await dlg.lastName().fill('Brown');
  await dlg.city().fill('Toronto');
  await dlg.submit().click();
  await page.getByTestId('snackbar-action').click();
  await expect.poll(() => revoked).toBe(true);
});

test('duplicate email: 409 keeps dialog open with email error', async ({ page }) => {
  await page.route('**/api/v1/users**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
  await page.route('**/api/v1/invitations', (route) => {
    if (route.request().method() === 'POST')
      return route.fulfill({
        status: 409,
        contentType: 'application/problem+json',
        body: JSON.stringify({ code: 'invitation.duplicate' }),
      });
    return route.continue();
  });
  await seedAdmin(page);
  const list = new UserListPage(page);
  const dlg = new InviteUserDialog(page);
  await list.goto();
  await list.inviteButton().click();
  await dlg.email().fill('dup@example.com');
  await dlg.firstName().fill('Dup');
  await dlg.lastName().fill('Licate');
  await dlg.city().fill('Toronto');
  await dlg.submit().click();
  await expect(dlg.root()).toBeVisible();
  await expect(dlg.emailError()).toContainText('already has a pending invitation');
});
