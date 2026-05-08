// traces_to: L2-028
import { test, expect } from '@playwright/test';
import { UserListPage } from '../../pages/UserListPage';
import { UserDetailDrawer } from '../../components/UserDetailDrawer';
import { ConfirmDialog } from '../../components/ConfirmDialog';

const seedUsers = [
  { id: 'admin', email: 'admin@example.com', name: 'Admin', role: 'SystemAdmin', city: 'Toronto', status: 'Active', lastSignIn: '2026-05-01' },
  { id: 'lead', email: 'lead@example.com', name: 'Lead', role: 'CityLead', city: 'Toronto', status: 'Active', lastSignIn: '2026-05-02' },
  { id: 'member', email: 'member@example.com', name: 'Member', role: 'Member', city: 'Toronto', status: 'Active', lastSignIn: '2026-05-03' },
];

async function seedAdmin(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[]; userId?: string }) => void;
    };
    win.__setTestToken?.('admin');
    win.__setRbac?.({ roles: ['SystemAdmin'], permissions: ['User:Manage'], userId: 'admin' });
  });
}

test('clicking a row opens the drawer with the user data', async ({ page }) => {
  await page.route('**/api/v1/users**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: seedUsers, total: 3 }) }),
  );
  await seedAdmin(page);
  const list = new UserListPage(page);
  const drawer = new UserDetailDrawer(page);
  await list.goto();
  await list.row('member@example.com').click();
  await expect(drawer.root()).toBeVisible();
  await expect(drawer.name()).toContainText('Member');
});

test('Disable → confirm → status flips and snackbar shows', async ({ page }) => {
  await page.route('**/api/v1/users**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: seedUsers, total: 3 }) }),
  );
  let disableCalled = false;
  await page.route('**/api/v1/users/member/disable', (route) => {
    disableCalled = true;
    return route.fulfill({ status: 204, body: '' });
  });
  await seedAdmin(page);
  const list = new UserListPage(page);
  const drawer = new UserDetailDrawer(page);
  const dlg = new ConfirmDialog(page);
  await list.goto();
  await list.row('member@example.com').click();
  await drawer.disable().click();
  await dlg.confirmButton().click();
  await expect.poll(() => disableCalled).toBe(true);
  await expect(drawer.status()).toContainText('Disabled');
  await expect(page.getByTestId('snackbar')).toContainText('User disabled');
});

test('self-row drawer hides Disable and Delete', async ({ page }) => {
  await page.route('**/api/v1/users**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: seedUsers, total: 3 }) }),
  );
  await seedAdmin(page);
  const list = new UserListPage(page);
  const drawer = new UserDetailDrawer(page);
  await list.goto();
  await list.row('admin@example.com').click();
  await expect(drawer.disable()).toHaveCount(0);
  await expect(drawer.delete()).toHaveCount(0);
});
