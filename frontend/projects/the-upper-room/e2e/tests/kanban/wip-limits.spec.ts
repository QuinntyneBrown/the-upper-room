// traces_to: L2-043, L2-045
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
  wipLimit?: number;
}

interface BoardDetail {
  id: string;
  name: string;
  description: string | null;
  columns: BoardColumn[];
  cards: BoardCard[];
}

const todo: BoardColumn = { id: 'todo', name: 'To Do', color: 'blue' };
const inProgress: BoardColumn = { id: 'inProgress', name: 'In Progress', color: 'amber', wipLimit: 3 };

function card(id: string, columnId: string, title: string): BoardCard {
  return { id, columnId, title, tags: [], assigneeName: null, dueDate: null };
}

function detail(cards: BoardCard[]): BoardDetail {
  return {
    id: 'b1',
    name: 'Outreach Q1',
    description: null,
    columns: [todo, inProgress],
    cards,
  };
}

async function seed(page: Page, initial: BoardCard[]): Promise<{ moveCalls: { cardId: string; body: unknown }[]; setCards: (cards: BoardCard[]) => void }> {
  const moveCalls: { cardId: string; body: unknown }[] = [];
  let cards = initial;

  await page.route('**/api/v1/boards/b1', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(detail(cards)) }),
  );

  await page.route(/\/api\/v1\/cards\/[^/]+\/move/, async (route) => {
    const url = route.request().url();
    const cardId = url.split('/cards/')[1].split('/')[0];
    const body = route.request().postDataJSON();
    moveCalls.push({ cardId, body });
    cards = cards.map((c) => (c.id === cardId ? { ...c, columnId: body.targetColumnId } : c));
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: cardId, columnId: body.targetColumnId }) });
  });

  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[]; userId?: string; cityId?: string }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ userId: 'u1', cityId: 'Toronto', roles: ['CityLead'], permissions: ['KanbanBoard:View', 'KanbanCard:Move'] });
  });

  return { moveCalls, setCards: (c) => { cards = c; } };
}

test('over-limit drop rejected with snackbar', async ({ page }) => {
  const cards = [
    card('a', 'inProgress', 'A'),
    card('b', 'inProgress', 'B'),
    card('c', 'inProgress', 'C'),
    card('d', 'todo', 'D'),
  ];
  const { moveCalls } = await seed(page, cards);
  const view = new BoardViewPage(page);
  await view.goto('b1');

  await view.dragCardTo('D', 'In Progress');

  await expect(page.getByTestId('snackbar')).toContainText('WIP limit reached for In Progress');
  expect(moveCalls.length).toBe(0);
});

test('over-limit column shows error-container highlight while dragging', async ({ page }) => {
  const cards = [
    card('a', 'inProgress', 'A'),
    card('b', 'inProgress', 'B'),
    card('c', 'inProgress', 'C'),
    card('d', 'todo', 'D'),
  ];
  await seed(page, cards);
  const view = new BoardViewPage(page);
  await view.goto('b1');

  const inProgressCol = view.column('In Progress');
  await page.evaluate((selector) => {
    document.querySelector(selector)?.dispatchEvent(new Event('dragenter-test', { bubbles: true }));
  }, '[data-testid="board-column-In Progress"]');

  await expect(inProgressCol).toHaveAttribute('data-over-limit', 'true');
});

test('removing one card unlocks subsequent drops', async ({ page }) => {
  const cards = [
    card('a', 'inProgress', 'A'),
    card('b', 'inProgress', 'B'),
    card('d', 'todo', 'D'),
  ];
  const { moveCalls } = await seed(page, cards);
  const view = new BoardViewPage(page);
  await view.goto('b1');

  await view.dragCardTo('D', 'In Progress');

  await expect.poll(() => moveCalls.length).toBe(1);
  expect((moveCalls[0].body as { targetColumnId: string }).targetColumnId).toBe('inProgress');
});
