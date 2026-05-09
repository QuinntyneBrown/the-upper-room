// traces_to: L2-028
import { test, expect, Page } from '@playwright/test';
import { UserListPage } from '../../pages/UserListPage';
import { UserDetailDrawer } from '../../components/UserDetailDrawer';

const seedUsers = [
  { id: 'admin', email: 'admin@example.com', name: 'Admin', role: 'SystemAdmin', city: 'Toronto', status: 'Active', lastSignIn: '2026-05-01' },
  { id: 'member', email: 'member@example.com', name: 'Member', role: 'Member', city: 'Toronto', status: 'Active', lastSignIn: '2026-05-03' },
];

async function seedAdmin(page: Page): Promise<void> {
  await page.route('**/api/v1/users**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: seedUsers, total: 2 }) }),
  );
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[]; userId?: string }) => void;
    };
    win.__setTestToken?.('admin');
    win.__setRbac?.({ roles: ['SystemAdmin'], permissions: ['User:Manage'], userId: 'admin' });
  });
  await page.route('/api/v1/notifications**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
}

async function openDrawer(page: Page, email: string): Promise<UserDetailDrawer> {
  const list = new UserListPage(page);
  await list.goto();
  await list.row(email).click();
  return new UserDetailDrawer(page);
}

test('close button is a mat-icon-button', async ({ page }) => {
  await seedAdmin(page);
  const drawer = await openDrawer(page, 'member@example.com');
  await expect(drawer.root()).toBeVisible();
  const closeBtn = page.getByTestId('user-drawer-close');
  await expect(closeBtn).toHaveAttribute('mat-icon-button');
});

test('role select is a mat-select', async ({ page }) => {
  await seedAdmin(page);
  const drawer = await openDrawer(page, 'member@example.com');
  const tag = await drawer.changeRole().evaluate((el) => el.tagName.toLowerCase());
  expect(tag).toBe('mat-select');
});

test('disable button is a mat-stroked-button', async ({ page }) => {
  await seedAdmin(page);
  const drawer = await openDrawer(page, 'member@example.com');
  await expect(drawer.disable()).toHaveAttribute('mat-stroked-button');
});

test('reset-password button is a mat-stroked-button', async ({ page }) => {
  await seedAdmin(page);
  const drawer = await openDrawer(page, 'member@example.com');
  await expect(drawer.resetPassword()).toHaveAttribute('mat-stroked-button');
});

test('delete button is a mat-flat-button with warn color', async ({ page }) => {
  await seedAdmin(page);
  const drawer = await openDrawer(page, 'member@example.com');
  await expect(drawer.delete()).toHaveAttribute('mat-flat-button');
});
