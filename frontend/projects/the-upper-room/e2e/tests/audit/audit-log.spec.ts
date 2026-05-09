// traces_to: L2-098
import { test, expect, Page } from '@playwright/test';
import { AuditLogPage } from '../../pages/AuditLogPage';

interface AuditEntryDto {
  id: string;
  timestamp: string;
  actorUserId: string;
  entityType: string;
  entityId: string;
  action: string;
  beforeJson: string | null;
  afterJson: string | null;
}

const seedEntries: AuditEntryDto[] = [
  {
    id: 'a1',
    timestamp: new Date().toISOString(),
    actorUserId: 'lead',
    entityType: 'Contact',
    entityId: 'c1',
    action: 'Delete',
    beforeJson: '{"id":"c1","name":"Alice"}',
    afterJson: null,
  },
  {
    id: 'a2',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    actorUserId: 'member',
    entityType: 'Contact',
    entityId: 'c2',
    action: 'Update',
    beforeJson: '{"id":"c2","name":"Bob"}',
    afterJson: '{"id":"c2","name":"Robert"}',
  },
];

async function seedAdmin(page: Page): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('admin-token');
    win.__setRbac?.({ roles: ['SystemAdmin'], permissions: [] });
  });
}

async function seedLead(page: Page): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: [] });
  });
}

test('SystemAdmin can access /admin/audit; CityLead is forbidden', async ({ page }) => {
  await page.route('**/api/v1/admin/audit**', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: seedEntries, total: 2, page: 1, pageSize: 20 }),
    }));

  await seedAdmin(page);
  const auditPage = new AuditLogPage(page);
  await auditPage.goto();
  await expect(auditPage.table()).toBeVisible();

  await seedLead(page);
  await auditPage.goto();
  await expect(page).toHaveURL(/forbidden/);
});

test('delete contact shows up at the top of the audit log', async ({ page }) => {
  const deleteEntry: AuditEntryDto = {
    id: 'a-new',
    timestamp: new Date().toISOString(),
    actorUserId: 'lead',
    entityType: 'Contact',
    entityId: 'c1',
    action: 'Delete',
    beforeJson: '{"id":"c1","name":"Alice"}',
    afterJson: null,
  };

  await page.route('**/api/v1/admin/audit**', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [deleteEntry, ...seedEntries], total: 3, page: 1, pageSize: 20 }),
    }));

  await seedAdmin(page);
  const auditPage = new AuditLogPage(page);
  await auditPage.goto();

  await expect(auditPage.row(0)).toContainText('Delete');
  await expect(auditPage.row(0)).toContainText('c1');
});

test('filter by Action=Delete returns only deletes', async ({ page }) => {
  const onlyDeletes = seedEntries.filter((e) => e.action === 'Delete');

  await page.route('**/api/v1/admin/audit**', (r) => {
    const url = new URL(r.request().url());
    const action = url.searchParams.get('action');
    const filtered = action ? seedEntries.filter((e) => e.action === action) : seedEntries;
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: filtered, total: filtered.length, page: 1, pageSize: 20 }),
    });
  });

  await seedAdmin(page);
  const auditPage = new AuditLogPage(page);
  await auditPage.goto();

  await auditPage.selectAction('Delete');
  await auditPage.applyButton().click();

  const rowCount = await auditPage.rows().count();
  expect(rowCount).toBe(onlyDeletes.length);
  for (let i = 0; i < rowCount; i++) {
    await expect(auditPage.row(i)).toContainText('Delete');
  }
});
