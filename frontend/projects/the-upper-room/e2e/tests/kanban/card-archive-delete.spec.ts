// traces_to: L2-046
import { test, expect, Page } from '@playwright/test';
import { BoardViewPage } from '../../pages/BoardViewPage';
import { CardDetailDialog } from '../../components/CardDetailDialog';

const todoColumn = { id: 'todo', name: 'To Do', color: 'blue' };

function makeCard(id: string, title: string, archived = false) {
  return { id, columnId: 'todo', title, tags: [], assigneeName: null, dueDate: null, swimlaneKey: null, archived };
}

function makeBoard(cards: ReturnType<typeof makeCard>[]) {
  return { id: 'b1', name: 'Test Board', description: null, columns: [todoColumn], cards, swimlaneMode: 'None' };
}

async function seedUser(page: Page): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['KanbanBoard:View', 'KanbanCard:Archive', 'KanbanCard:Delete'] });
  });
}

test('archive card → disappears from board; visible under Show archived toggle', async ({ page }) => {
  const cards = [makeCard('c1', 'Plan kickoff')];
  let boardCards = [...cards];
  const patchCalls: unknown[] = [];

  await page.route('**/api/v1/boards/b1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeBoard(boardCards)) }));
  await page.route(/\/api\/v1\/cards\/[^/]+$/, async (route) => {
    if (route.request().method() === 'PATCH') {
      const body = route.request().postDataJSON();
      patchCalls.push(body);
      boardCards = boardCards.map((c) => ({ ...c, ...(body as Record<string, unknown>) }));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(boardCards[0]) });
    } else {
      await route.continue();
    }
  });

  await seedUser(page);
  const view = new BoardViewPage(page);
  await view.goto('b1');

  await view.card('Plan kickoff').click();
  const dialog = new CardDetailDialog(page);
  await expect(dialog.root()).toBeVisible();

  await dialog.archiveButton().click();

  await expect(view.card('Plan kickoff')).toBeHidden();
  await expect.poll(() => patchCalls.length).toBe(1);
  expect((patchCalls[0] as Record<string, unknown>)['archived']).toBe(true);

  await view.showArchivedToggle().click();
  await expect(view.card('Plan kickoff')).toBeVisible();
});

test('delete card with typed-confirm → card removed and snackbar shown', async ({ page }) => {
  const cards = [makeCard('c1', 'Plan kickoff')];
  const deleteCalls: string[] = [];

  await page.route('**/api/v1/boards/b1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeBoard(cards)) }));
  await page.route(/\/api\/v1\/cards\/([^/]+)$/, async (route) => {
    if (route.request().method() === 'DELETE') {
      const url = route.request().url();
      const id = url.split('/cards/')[1];
      deleteCalls.push(id);
      await route.fulfill({ status: 204 });
    } else {
      await route.continue();
    }
  });

  await seedUser(page);
  const view = new BoardViewPage(page);
  await view.goto('b1');

  await view.card('Plan kickoff').click();
  const dialog = new CardDetailDialog(page);
  await expect(dialog.root()).toBeVisible();

  await dialog.deleteButton().click();

  const confirmDialog = page.getByTestId('confirm-dialog');
  await expect(confirmDialog).toBeVisible();

  await page.getByTestId('confirm-typed-input').fill('Plan kickoff');
  await page.getByTestId('confirm-button').click();

  await expect(view.card('Plan kickoff')).toBeHidden();
  await expect.poll(() => deleteCalls.length).toBe(1);
  expect(deleteCalls[0]).toBe('c1');

  await expect(page.getByTestId('snackbar')).toContainText('deleted');
});
