// traces_to: L2-098
import { test, expect } from '@playwright/test';
import { AuditLogPage } from '../../pages/AuditLogPage';

const seedEntries = [
  {
    id: 'a1',
    timestamp: new Date().toISOString(),
    actorUserId: 'lead',
    entityType: 'Contact',
    entityId: 'c1',
    action: 'Delete',
    beforeJson: null,
    afterJson: null,
  },
];

async function seedAdmin(page: import('@playwright/test').Page): Promise<void> {
  await page.route('**/api/v1/admin/audit**', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: seedEntries, total: 1, page: 1, pageSize: 20 }),
    }),
  );
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('admin-token');
    win.__setRbac?.({ roles: ['SystemAdmin'], permissions: [] });
  });
  await page.route('/api/v1/notifications**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
}

test('actor filter input is wrapped in a Material form field', async ({ page }) => {
  await seedAdmin(page);
  const auditPage = new AuditLogPage(page);
  await auditPage.goto();
  const field = page.locator('mat-form-field').filter({ has: page.getByTestId('audit-filter-actor') });
  await expect(field).toBeVisible();
});

test('apply button is a Material flat button', async ({ page }) => {
  await seedAdmin(page);
  const auditPage = new AuditLogPage(page);
  await auditPage.goto();
  await expect(auditPage.applyButton()).toHaveAttribute('mat-flat-button');
});

test('previous page button is a Material stroked button', async ({ page }) => {
  await seedAdmin(page);
  const auditPage = new AuditLogPage(page);
  await auditPage.goto();
  await expect(auditPage.prevButton()).toHaveAttribute('mat-stroked-button');
});

test('next page button is a Material stroked button', async ({ page }) => {
  await seedAdmin(page);
  const auditPage = new AuditLogPage(page);
  await auditPage.goto();
  await expect(auditPage.nextButton()).toHaveAttribute('mat-stroked-button');
});

test('table renders with mat-table', async ({ page }) => {
  await seedAdmin(page);
  const auditPage = new AuditLogPage(page);
  await auditPage.goto();
  await expect(page.locator('table[mat-table]')).toBeVisible();
});
