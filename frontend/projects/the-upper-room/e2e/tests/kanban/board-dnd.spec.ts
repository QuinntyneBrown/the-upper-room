// traces_to: L2-045
import { test, expect, Page } from '@playwright/test';
import { BoardViewPage } from '../../pages/BoardViewPage';

interface BoardCard {
  id: string;
  columnId: string;
  title: string;
  tags: { id: string; name: string; color: string }[];
  assigneeName: string | null;
  dueDate: string | null;
}

interface BoardColumn {
  id: string;
  name: string;
  color: string;
}

interface BoardDetail {
  id: string;
  name: string;
  description: string | null;
  columns: BoardColumn[];
  cards: BoardCard[];
}

const todoColumn: BoardColumn = { id: 'todo', name: 'To Do', color: 'blue' };
const inProgressColumn: BoardColumn = { id: 'inProgress', name: 'In Progress', color: 'amber' };

const callSponsor: BoardCard = {
  id: 'card-call', columnId: 'todo', title: 'Call sponsor', tags: [], assigneeName: null, dueDate: null,
};
const sendBrief: BoardCard = {
  id: 'card-brief', columnId: 'inProgress', title: 'Send brief', tags: [], assigneeName: null, dueDate: null,
};

function detailWithCardIn(columnId: string): BoardDetail {
  return {
    id: 'b1',
    name: 'Outreach Q1',
    description: null,
    columns: [todoColumn, inProgressColumn],
    cards: [{ ...callSponsor, columnId }, sendBrief],
  };
}

async function seed(page: Page, initialState: { cardColumnId: string }): Promise<{ moveCalls: { cardId: string; body: unknown }[] }> {
  const moveCalls: { cardId: string; body: unknown }[] = [];
  let currentState = initialState.cardColumnId;

  await page.route('**/api/v1/boards/b1', (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(detailWithCardIn(currentState)),
    });
  });

  await page.route(/\/api\/v1\/cards\/[^/]+\/move/, async (route) => {
    const url = route.request().url();
    const cardId = url.split('/cards/')[1].split('/')[0];
    const body = route.request().postDataJSON();
    moveCalls.push({ cardId, body });
    if (typeof body?.targetColumnId === 'string') {
      currentState = body.targetColumnId;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: cardId, columnId: currentState }),
    });
  });

  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[]; userId?: string; cityId?: string }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ userId: 'u1', cityId: 'Toronto', roles: ['CityLead'], permissions: ['KanbanBoard:View', 'KanbanCard:Move'] });
  });

  return { moveCalls };
}

test('drag "Call sponsor" from "To Do" to "In Progress" persists after reload', async ({ page }) => {
  const { moveCalls } = await seed(page, { cardColumnId: 'todo' });
  const view = new BoardViewPage(page);
  await view.goto('b1');

  await view.dragCardTo('Call sponsor', 'In Progress');

  await expect.poll(() => moveCalls.length).toBeGreaterThan(0);
  expect(moveCalls[0].cardId).toBe('card-call');
  expect((moveCalls[0].body as { targetColumnId: string }).targetColumnId).toBe('inProgress');

  await view.reload();
  const inProgress = view.column('In Progress');
  await expect(inProgress).toContainText('Call sponsor');
});

test('order within destination column is preserved after reload', async ({ page }) => {
  await seed(page, { cardColumnId: 'todo' });
  const view = new BoardViewPage(page);
  await view.goto('b1');

  await view.dragCardTo('Call sponsor', 'In Progress');
  await view.reload();

  const inProgress = view.column('In Progress');
  const titles = await inProgress.locator('[data-testid^="board-card-"]').allTextContents();
  expect(titles.some((t) => t.includes('Call sponsor'))).toBe(true);
  expect(titles.some((t) => t.includes('Send brief'))).toBe(true);
});

test('move POST is fired with action context for audit', async ({ page }) => {
  const { moveCalls } = await seed(page, { cardColumnId: 'todo' });
  const view = new BoardViewPage(page);
  await view.goto('b1');

  await view.dragCardTo('Call sponsor', 'In Progress');

  await expect.poll(() => moveCalls.length).toBe(1);
  const body = moveCalls[0].body as { targetColumnId: string; sourceColumnId?: string };
  expect(body.targetColumnId).toBe('inProgress');
  expect(body.sourceColumnId).toBe('todo');
});
