// traces_to: L2-042
import { test, expect } from '@playwright/test';
import { ContactDetailPage } from '../../pages/ContactDetailPage';
import { NotesTab } from '../../components/NotesTab';

const contact = { id: 'c1', name: 'Alice Smith', cityId: 'Toronto', phones: [], emails: [], tags: [], archived: false };
const me = { id: 'lead', email: 'lead@example.com', city: 'Toronto', roles: ['CityLead'], permissions: [] };

interface NoteData {
  id: string; subjectType: string; subjectId: string;
  bodyMarkdown: string; bodyHtmlSanitized: string; history: unknown[];
  createdBy: string; createdAt: string; updatedAt: string;
}

function makeNote(overrides: Partial<NoteData> = {}): NoteData {
  const now = new Date().toISOString();
  return {
    id: 'n1', subjectType: 'Contact', subjectId: 'c1',
    bodyMarkdown: 'Hello world', bodyHtmlSanitized: '<p>Hello world</p>',
    history: [], createdBy: 'lead', createdAt: now, updatedAt: now,
    ...overrides,
  };
}

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Note:Create', 'Note:Update', 'Note:Delete', 'Contact:Read'] });
  });
}

async function seedMember(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('member-token');
    win.__setRbac?.({ roles: ['Member'], permissions: ['Note:Read', 'Note:Create', 'Contact:Read'] });
  });
}

test('submit Hello world → note at top with author and just now', async ({ page }) => {
  const note = makeNote();
  await page.route('**/api/v1/contacts/c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(contact) }));
  await page.route('**/api/v1/users/me', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(me) }));
  await page.route('**/api/v1/notes**', (r) => {
    if (r.request().method() === 'GET')
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
    if (r.request().method() === 'POST')
      return r.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(note) });
    return r.continue();
  });

  await seedLead(page);
  const detail = new ContactDetailPage(page);
  await detail.goto('c1');
  await detail.tab('notes').click();

  const notes = new NotesTab(page);
  await notes.composer().fill('Hello world');
  await notes.submitButton().click();

  await expect(notes.note(0)).toBeVisible();
  await expect(notes.noteBody(0)).toContainText('Hello world');
  await expect(notes.noteAuthor(0)).toContainText('lead');
  await expect(notes.noteTime(0)).toContainText('just now');
});

test('note shorter than 2 chars → validation error and composer keeps focus', async ({ page }) => {
  await page.route('**/api/v1/contacts/c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(contact) }));
  await page.route('**/api/v1/users/me', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(me) }));
  await page.route('**/api/v1/notes**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }));

  await seedLead(page);
  const detail = new ContactDetailPage(page);
  await detail.goto('c1');
  await detail.tab('notes').click();

  const notes = new NotesTab(page);
  await notes.composer().fill('x');
  await notes.submitButton().click();

  await expect(notes.composerError()).toContainText('Notes must be at least 2 characters.');
  await expect(notes.composer()).toBeFocused();
});

test('edit note → form replaces body; save updates rendered HTML', async ({ page }) => {
  const original = makeNote({ bodyMarkdown: 'Original text', bodyHtmlSanitized: '<p>Original text</p>' });
  const updated = makeNote({ bodyMarkdown: 'Updated text', bodyHtmlSanitized: '<p>Updated text</p>' });

  await page.route('**/api/v1/contacts/c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(contact) }));
  await page.route('**/api/v1/users/me', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(me) }));
  await page.route('**/api/v1/notes**', (r) => {
    if (r.request().method() === 'GET')
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [original], total: 1 }) });
    if (r.request().method() === 'PUT')
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(updated) });
    return r.continue();
  });

  await seedLead(page);
  const detail = new ContactDetailPage(page);
  await detail.goto('c1');
  await detail.tab('notes').click();

  const notes = new NotesTab(page);
  await notes.noteEditButton(0).click();
  await expect(notes.noteEditForm(0)).toBeVisible();
  await notes.noteEditInput(0).fill('Updated text');
  await notes.noteSaveButton(0).click();

  await expect(notes.noteBody(0)).toContainText('Updated text');
  await expect(notes.noteEditForm(0)).toBeHidden();
});

test('author sees Delete; non-author Member does not', async ({ page }) => {
  const note = makeNote({ createdBy: 'lead' });
  const memberMe = { id: 'member', email: 'member@example.com', city: 'Toronto', roles: ['Member'], permissions: [] };

  await page.route('**/api/v1/contacts/c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(contact) }));
  await page.route('**/api/v1/notes**', (r) => {
    if (r.request().method() === 'GET')
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [note], total: 1 }) });
    if (r.request().method() === 'DELETE') return r.fulfill({ status: 204 });
    return r.continue();
  });

  // Lead (author) sees Delete
  await page.route('**/api/v1/users/me', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(me) }));
  await seedLead(page);
  const detail = new ContactDetailPage(page);
  await detail.goto('c1');
  await detail.tab('notes').click();
  const notes = new NotesTab(page);
  await expect(notes.noteDeleteButton(0)).toBeVisible();

  // Member (non-author) does not see Delete
  await page.unroute('**/api/v1/users/me');
  await page.route('**/api/v1/users/me', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(memberMe) }));
  await seedMember(page);
  await detail.goto('c1');
  await detail.tab('notes').click();
  await expect(notes.noteDeleteButton(0)).toBeHidden();
});

test('note from Mar 5 2026 shows absolute date', async ({ page }) => {
  const oldNote = makeNote({ createdAt: '2026-03-05T12:00:00Z', updatedAt: '2026-03-05T12:00:00Z' });

  await page.route('**/api/v1/contacts/c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(contact) }));
  await page.route('**/api/v1/users/me', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(me) }));
  await page.route('**/api/v1/notes**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [oldNote], total: 1 }) }));

  await seedLead(page);
  const detail = new ContactDetailPage(page);
  await detail.goto('c1');
  await detail.tab('notes').click();

  const notes = new NotesTab(page);
  await expect(notes.note(0)).toBeVisible();
  await expect(notes.noteTime(0)).toContainText('Mar 5, 2026');
});
