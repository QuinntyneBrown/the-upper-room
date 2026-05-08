// traces_to: L2-041
import { test, expect } from '@playwright/test';
import { ContactDetailPage } from '../../pages/ContactDetailPage';
import { NoteHistoryDialog } from '../../components/NoteHistoryDialog';

const contact = { id: 'c1', name: 'Alice Smith', cityId: 'Toronto', phones: [], emails: [], tags: [], archived: false };
const lead = { id: 'lead', email: 'lead@example.com', city: 'Toronto', roles: ['CityLead'], permissions: [] };
const member = { id: 'member', email: 'member@example.com', city: 'Toronto', roles: ['Member'], permissions: [] };

function makeHistory(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `v${i + 1}`,
    bodyMarkdown: `Version ${i + 1}`,
    bodyHtmlSanitized: `<p>Version ${i + 1}</p>`,
    createdAt: new Date(Date.now() - (i + 1) * 60_000).toISOString(),
    createdBy: 'lead',
  }));
}

function makeNote(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: 'n1', subjectType: 'Contact', subjectId: 'c1',
    bodyMarkdown: 'Current body', bodyHtmlSanitized: '<p>Current body</p>',
    history: [], createdBy: 'lead', createdAt: now, updatedAt: now,
    ...overrides,
  };
}

async function seedUser(page: import('@playwright/test').Page, token: string): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate((t) => {
    const win = window as unknown as { __setTestToken?: (t: string) => void };
    win.__setTestToken?.(t);
  }, token);
}

test('note edited 3 times → 3 prior versions; preview shows selected version HTML', async ({ page }) => {
  const history = makeHistory(3);
  const note = makeNote({ history });

  await page.route('**/api/v1/contacts/c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(contact) }));
  await page.route('**/api/v1/users/me', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(lead) }));
  await page.route('**/api/v1/notes**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [note], total: 1 }) }));

  await seedUser(page, 'lead-token');
  const detail = new ContactDetailPage(page);
  await detail.goto('c1');
  await detail.tab('notes').click();

  const dialog = new NoteHistoryDialog(page);
  await dialog.historyButton(0).click();
  await expect(dialog.dialog()).toBeVisible();

  await expect(dialog.versionItem(0)).toBeVisible();
  await expect(dialog.versionItem(1)).toBeVisible();
  await expect(dialog.versionItem(2)).toBeVisible();

  await dialog.versionItem(1).click();
  await expect(dialog.preview()).toContainText('Version 2');

  await dialog.closeButton().click();
  await expect(dialog.dialog()).toBeHidden();
});

test('member viewing another user note can still open history', async ({ page }) => {
  const history = makeHistory(1);
  const note = makeNote({ createdBy: 'lead', history });

  await page.route('**/api/v1/contacts/c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(contact) }));
  await page.route('**/api/v1/users/me', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(member) }));
  await page.route('**/api/v1/notes**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [note], total: 1 }) }));

  await seedUser(page, 'member-token');
  const detail = new ContactDetailPage(page);
  await detail.goto('c1');
  await detail.tab('notes').click();

  const dialog = new NoteHistoryDialog(page);
  await expect(dialog.historyButton(0)).toBeVisible();
  await dialog.historyButton(0).click();
  await expect(dialog.dialog()).toBeVisible();
  await expect(dialog.versionItem(0)).toBeVisible();
});
