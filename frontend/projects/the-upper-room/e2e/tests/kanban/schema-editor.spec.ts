// Traces to: L2-047
import { test, expect, Locator, Page, Route } from '@playwright/test';
import { CardSchemaEditor } from '../../components/CardSchemaEditor';
import { CardDetailDialog } from '../../components/CardDetailDialog';
import { BoardConfigurePage } from '../../pages/BoardConfigurePage';
import { BoardViewPage } from '../../pages/BoardViewPage';
import { ConfirmDialog } from '../../components/ConfirmDialog';

interface SchemaField {
  key: string;
  type: string;
  label: string;
  required: boolean;
  options: string[];
}

interface Card {
  id: string;
  columnId: string;
  position: number;
  data: Record<string, string | null>;
  assigneeUserId: string | null;
  tagIds: string[];
  archived: boolean;
}

interface Board {
  id: string;
  name: string;
  description: string | null;
  cityId: string;
  wipLimitPerColumn: number | null;
  schema: SchemaField[];
  columns: { id: string; name: string; order: number; color: string; wipLimit: number | null }[];
  cards: Card[];
}

function makeBoard(): Board {
  return {
    id: 'b1',
    name: 'Outreach Pipeline',
    description: null,
    cityId: 'Toronto',
    wipLimitPerColumn: null,
    schema: [
      { key: 'title', type: 'Text', label: 'Title', required: true, options: [] },
      { key: 'notes', type: 'Textarea', label: 'Notes', required: false, options: [] },
    ],
    columns: [
      { id: 'col-backlog', name: 'Backlog', order: 0, color: 'Slate', wipLimit: null },
      { id: 'col-progress', name: 'In Progress', order: 1, color: 'Slate', wipLimit: null },
    ],
    cards: [
      {
        id: 'card-1',
        columnId: 'col-backlog',
        position: 1,
        data: { title: 'First card', notes: 'note one' },
        assigneeUserId: null,
        tagIds: [],
        archived: false,
      },
      {
        id: 'card-2',
        columnId: 'col-backlog',
        position: 2,
        data: { title: 'Second card', notes: 'note two' },
        assigneeUserId: null,
        tagIds: [],
        archived: false,
      },
    ],
  };
}

/**
 * Re-installs the test access token and RBAC snapshot on every page load.
 * Necessary because AccessTokenStore + PermissionsService keep state in
 * memory only — `page.goto` triggers a full Angular bootstrap that wipes
 * any previously-set token, so the auth guard would redirect to /sign-in.
 *
 * The init script polls for the window functions installed by those
 * services and invokes them as soon as they exist.
 */
/**
 * Re-installs the test access token + RBAC snapshot on every page load.
 *
 * AccessTokenStore and PermissionsService keep state purely in memory and
 * expose `window.__setTestToken` / `window.__setRbac` from their root
 * constructors. Because the auth guard reads the token during the same
 * synchronous tick those services are instantiated, we intercept the
 * assignment via a property setter and invoke the function immediately —
 * before the guard checks `tokens.current()`.
 */
async function seedLead(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const token = 'lead-token';
    const rbac = {
      userId: 'lead',
      cityId: 'Toronto',
      roles: ['CityLead'],
      permissions: ['KanbanBoard:Read', 'KanbanBoard:Update', 'KanbanBoard:Create'],
    };
    Object.defineProperty(window, '__setTestToken', {
      configurable: true,
      set(fn: (t: string) => void) {
        fn(token);
        Object.defineProperty(window, '__setTestToken', {
          configurable: true,
          writable: true,
          value: fn,
        });
      },
    });
    Object.defineProperty(window, '__setRbac', {
      configurable: true,
      set(fn: (s: typeof rbac) => void) {
        fn(rbac);
        Object.defineProperty(window, '__setRbac', {
          configurable: true,
          writable: true,
          value: fn,
        });
      },
    });
  });
}

/**
 * Mounts a single mutable in-memory board and routes API calls against it.
 * Each test gets its own copy via the returned `state.board` reference.
 */
async function mountBoardApi(page: Page): Promise<{ board: Board }> {
  const state = { board: makeBoard() };

  // The shell calls GET /api/v1/users/me on auth-guard hit. Stub it so the
  // global error interceptor doesn't show its "something went wrong" snackbar.
  await page.route('**/api/v1/users/me', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'lead',
        email: 'lead@example.com',
        city: 'Toronto',
        roles: ['CityLead'],
        permissions: ['KanbanBoard:Read', 'KanbanBoard:Update', 'KanbanBoard:Create'],
      }),
    });
  });

  await page.route('**/api/v1/boards/b1', async (route: Route) => {
    const req = route.request();
    if (req.method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(state.board) });
      return;
    }
    await route.continue();
  });

  await page.route('**/api/v1/boards/b1/schema', async (route: Route) => {
    const req = route.request();
    if (req.method() === 'PATCH') {
      const body = JSON.parse(req.postData() ?? '{}') as { fields: SchemaField[] };
      const newKeys = new Set(body.fields.map((f) => f.key.toLowerCase()));
      state.board.schema = body.fields.map((f) => ({
        key: f.key,
        type: f.type,
        label: f.label,
        required: f.required,
        options: f.options ?? [],
      }));
      // Drop card data for keys that no longer exist.
      state.board.cards = state.board.cards.map((c) => {
        const next: Record<string, string | null> = {};
        for (const [k, v] of Object.entries(c.data)) {
          if (newKeys.has(k.toLowerCase())) next[k] = v;
        }
        return { ...c, data: next };
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(state.board),
      });
      return;
    }
    await route.continue();
  });

  await page.route('**/api/v1/boards/b1/cards/*', async (route: Route) => {
    const req = route.request();
    const url = new URL(req.url());
    const cardId = url.pathname.split('/').pop()!;
    const card = state.board.cards.find((c) => c.id === cardId);
    if (!card) {
      await route.fulfill({ status: 404 });
      return;
    }
    if (req.method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(card) });
      return;
    }
    if (req.method() === 'PUT') {
      const body = JSON.parse(req.postData() ?? '{}') as { data: Record<string, string | null> };
      const validKeys = new Set(state.board.schema.map((f) => f.key.toLowerCase()));
      const filtered: Record<string, string | null> = {};
      for (const [k, v] of Object.entries(body.data)) {
        if (validKeys.has(k.toLowerCase())) filtered[k] = v;
      }
      card.data = filtered;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(card) });
      return;
    }
    await route.continue();
  });

  return state;
}

/**
 * `Locator.click({ force: true })` skips Playwright's actionability checks
 * but still simulates a real pointer press, which lands on whatever element
 * is topmost at the click coordinates — and the app shell's drawer (a fixed
 * `<nav>` that visually translates off-screen) is reported as the topmost
 * element by Playwright's hit-test, swallowing every click. Calling the
 * DOM-native `click()` directly invokes the button's handler without any
 * coordinate hit-test, which is what we want for Angular `(click)` bindings.
 */
async function nativeClick(locator: Locator): Promise<void> {
  await locator.dispatchEvent('click');
}

/**
 * Hide the app shell's drawer + breadcrumbs so they don't sit on top of
 * test targets and trip Playwright's actionability hit-tests. This is
 * purely a test-environment concern; the layout is fine for users.
 */
async function neutralizeShellOverlays(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.querySelectorAll('[data-testid="drawer"], [data-testid="snackbar"]').forEach((el) => el.remove());
  });
}

test.describe('TASK-0096 — Card schema editor', () => {
  test('Add a Select field "Priority" → card detail dialog shows it', async ({ page }) => {
    const state = await mountBoardApi(page);
    await seedLead(page);

    const configurePage = new BoardConfigurePage(page);
    const editor = new CardSchemaEditor(page);

    await configurePage.goto('b1');
    await neutralizeShellOverlays(page);
    await expect(editor.root()).toBeVisible();
    await expect(editor.fieldRows()).toHaveCount(2);

    await editor.addFieldButton().dispatchEvent('click');
    await expect(editor.fieldRows()).toHaveCount(3);

    // Edit the new field (index 2): set key, label, type=Select, options.
    await editor.fieldKeyInput(2).fill('priority');
    await editor.fieldLabelInput(2).fill('Priority');
    await editor.chooseType(2, 'Select');

    await editor.addOptionButton(2).dispatchEvent('click');
    await editor.optionInput(2, 0).fill('Low');
    await editor.addOptionButton(2).dispatchEvent('click');
    await editor.optionInput(2, 1).fill('Med');
    await editor.addOptionButton(2).dispatchEvent('click');
    await editor.optionInput(2, 2).fill('High');

    await editor.saveButton().dispatchEvent('click');

    // Verify the mock backend received the new schema.
    await expect.poll(() => state.board.schema.length).toBe(3);
    expect(state.board.schema.find((f) => f.key === 'priority')?.type).toBe('Select');
    expect(state.board.schema.find((f) => f.key === 'priority')?.options).toEqual(['Low', 'Med', 'High']);

    // Open the card detail dialog from the board view; "Priority" should now appear.
    const view = new BoardViewPage(page);
    await view.goto('b1');
    await neutralizeShellOverlays(page);
    await view.card('card-1').dispatchEvent('click');
    const dialog = new CardDetailDialog(page);
    await expect(dialog.root()).toBeVisible();
    await expect(dialog.field('priority')).toBeVisible();
  });

  test('Remove a required field with data → confirmation warns of N affected cards', async ({ page }) => {
    await mountBoardApi(page);
    await seedLead(page);

    const configurePage = new BoardConfigurePage(page);
    const editor = new CardSchemaEditor(page);

    await configurePage.goto('b1');
    await neutralizeShellOverlays(page);
    await expect(editor.fieldRows()).toHaveCount(2);

    // The seeded "title" field is required and has data on 2 cards.
    await editor.removeFieldButton(0).dispatchEvent('click');

    const confirm = new ConfirmDialog(page);
    await expect(confirm.root()).toBeVisible();
    await expect(confirm.body()).toContainText('Removing this field will erase data on 2 cards');
  });

  test('Reorder fields → card detail dialog reflects new order', async ({ page }) => {
    const state = await mountBoardApi(page);
    await seedLead(page);

    const configurePage = new BoardConfigurePage(page);
    const editor = new CardSchemaEditor(page);

    await configurePage.goto('b1');
    await neutralizeShellOverlays(page);
    await expect(editor.fieldRows()).toHaveCount(2);

    // Move "title" (index 0) below "notes".
    await editor.moveDownButton(0).dispatchEvent('click');
    await editor.saveButton().dispatchEvent('click');

    await expect.poll(() => state.board.schema.map((f) => f.key)).toEqual(['notes', 'title']);

    // Open card detail dialog and verify field order in DOM.
    const view = new BoardViewPage(page);
    await view.goto('b1');
    await neutralizeShellOverlays(page);
    await view.card('card-1').dispatchEvent('click');

    const dialog = new CardDetailDialog(page);
    await expect(dialog.root()).toBeVisible();
    const orderedKeys = await page.locator('[data-testid^="card-field-"][data-field-type]').evaluateAll(
      (els) =>
        els.map((el) => (el as HTMLElement).getAttribute('data-testid')!.replace(/^card-field-/, '')),
    );
    expect(orderedKeys).toEqual(['notes', 'title']);
  });
});
