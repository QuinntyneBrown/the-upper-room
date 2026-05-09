// traces_to: L2-027
import { test, expect, Page } from '@playwright/test';
import { UserListPage } from '../../pages/UserListPage';
import { InviteUserDialog } from '../../components/InviteUserDialog';

async function seedAdmin(page: Page): Promise<void> {
  await page.route('**/api/v1/users**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('admin');
    win.__setRbac?.({ roles: ['SystemAdmin'], permissions: ['User:Manage'] });
  });
  await page.route('/api/v1/notifications**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
}

async function openDialog(page: Page): Promise<InviteUserDialog> {
  const list = new UserListPage(page);
  await list.goto();
  await list.inviteButton().click();
  return new InviteUserDialog(page);
}

test('email input is wrapped in a mat-form-field', async ({ page }) => {
  await seedAdmin(page);
  const dlg = await openDialog(page);
  await expect(dlg.root()).toBeVisible();
  const field = page.locator('mat-form-field').filter({ has: dlg.email() });
  await expect(field).toBeVisible();
});

test('role select is a mat-select', async ({ page }) => {
  await seedAdmin(page);
  const dlg = await openDialog(page);
  await expect(dlg.role()).toBeVisible();
  const tag = await dlg.role().evaluate((el) => el.tagName.toLowerCase());
  expect(tag).toBe('mat-select');
});

test('submit button is a mat-flat-button', async ({ page }) => {
  await seedAdmin(page);
  const dlg = await openDialog(page);
  await expect(dlg.submit()).toHaveAttribute('mat-flat-button');
});

test('cancel button is a mat-button', async ({ page }) => {
  await seedAdmin(page);
  const dlg = await openDialog(page);
  await expect(dlg.cancel()).toHaveAttribute('mat-button');
});

test('dialog opens inside a Material dialog overlay', async ({ page }) => {
  await seedAdmin(page);
  const dlg = await openDialog(page);
  await expect(dlg.root()).toBeVisible();
  const overlay = page.locator('mat-dialog-container').filter({ has: dlg.root() });
  await expect(overlay).toBeVisible();
});
