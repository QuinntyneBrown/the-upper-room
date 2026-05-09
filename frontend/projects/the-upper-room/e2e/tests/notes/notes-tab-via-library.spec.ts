// traces_to: L2-041, L2-042
// Verifies that TarNotes from the components library renders and creates notes correctly
// after the component is moved from src/app/notes/ to components/src/lib/notes/.
import { test, expect } from '@playwright/test';
import { ContactDetailPage } from '../../pages/ContactDetailPage';
import { NotesTab } from '../../components/NotesTab';

const contact = {
  id: 'c1',
  name: 'Alice Smith',
  cityId: 'Toronto',
  phones: [],
  emails: [],
  tags: [],
  archived: false,
};
const me = {
  id: 'lead',
  email: 'lead@example.com',
  city: 'Toronto',
  roles: ['CityLead'],
  permissions: [],
};

function makeNote(overrides: Record<string, unknown> = {}) {
  const now = new Date().toISOString();
  return {
    id: 'n1',
    subjectType: 'Contact',
    subjectId: 'c1',
    bodyMarkdown: 'Library note',
    bodyHtmlSanitized: '<p>Library note</p>',
    history: [],
    createdBy: 'lead',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({
      roles: ['CityLead'],
      permissions: ['Note:Create', 'Note:Update', 'Note:Delete', 'Contact:Read'],
    });
  });
}

test('notes tab renders correctly after move to components library', async ({ page }) => {
  await page.route('**/api/v1/contacts/c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(contact) }),
  );
  await page.route('**/api/v1/users/me', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(me) }),
  );
  await page.route('**/api/v1/notes**', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], total: 0 }),
    }),
  );

  await seedLead(page);
  const detail = new ContactDetailPage(page);
  await detail.goto('c1');
  await detail.tab('notes').click();

  const notes = new NotesTab(page);
  await expect(notes.composer()).toBeVisible();
  await expect(notes.submitButton()).toBeVisible();
});

test('create note via library component appears in list', async ({ page }) => {
  const note = makeNote();
  await page.route('**/api/v1/contacts/c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(contact) }),
  );
  await page.route('**/api/v1/users/me', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(me) }),
  );
  await page.route('**/api/v1/notes**', (r) => {
    if (r.request().method() === 'GET')
      return r.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], total: 0 }),
      });
    if (r.request().method() === 'POST')
      return r.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(note) });
    return r.continue();
  });

  await seedLead(page);
  const detail = new ContactDetailPage(page);
  await detail.goto('c1');
  await detail.tab('notes').click();

  const notes = new NotesTab(page);
  await notes.composer().fill('Library note');
  await notes.submitButton().click();

  await expect(notes.note(0)).toBeVisible();
  await expect(notes.noteBody(0)).toContainText('Library note');
});
