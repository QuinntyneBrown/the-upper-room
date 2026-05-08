// traces_to: L2-043
import { test, expect, Page } from '@playwright/test';
import { BoardViewPage } from '../../pages/BoardViewPage';
import { BoardConfigurePage } from '../../pages/BoardConfigurePage';

interface BoardCard {
  id: string; columnId: string; title: string;
  tags: unknown[]; assigneeName: string | null; dueDate: null;
  swimlaneKey: string | null;
}

interface BoardColumn { id: string; name: string; color: string }

interface BoardDetail {
  id: string; name: string; description: null;
  columns: BoardColumn[]; cards: BoardCard[];
  swimlaneMode: string;
}

const todoColumn: BoardColumn = { id: 'todo', name: 'To Do', color: 'blue' };
const inProgressColumn: BoardColumn = { id: 'inProgress', name: 'In Progress', color: 'amber' };

function makeCard(id: string, assignee: string, columnId = 'todo'): BoardCard {
  return { id, columnId, title: `Task ${assignee}`, tags: [], assigneeName: assignee, dueDate: null, swimlaneKey: assignee };
}

function makeBoard(swimlaneMode: string, cards: BoardCard[]): BoardDetail {
  return { id: 'b1', name: 'Test Board', description: null, columns: [todoColumn, inProgressColumn], cards, swimlaneMode };
}

async function seedUser(page: Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[]; userId?: string; cityId?: string }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ userId: 'u1', cityId: 'Toronto', roles: ['CityLead'], permissions: ['KanbanBoard:View', 'KanbanBoard:Configure', 'KanbanCard:Move'] });
  });
}

test('configure board with Assignee swimlanes → 3 horizontal bands', async ({ page }) => {
  const cards = [makeCard('c1', 'Alice'), makeCard('c2', 'Bob'), makeCard('c3', 'Carol')];
  const board = makeBoard('Assignee', cards);

  await page.route('**/api/v1/boards/b1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(board) }));

  await seedUser(page);
  const view = new BoardViewPage(page);
  await view.goto('b1');

  await expect(page.getByTestId('board-swimlane-Alice')).toBeVisible();
  await expect(page.getByTestId('board-swimlane-Bob')).toBeVisible();
  await expect(page.getByTestId('board-swimlane-Carol')).toBeVisible();
});

test('drag card across lanes posts targetSwimlaneKey in move body', async ({ page }) => {
  const cards = [makeCard('c1', 'Alice'), makeCard('c2', 'Bob')];
  const moveCalls: unknown[] = [];

  await page.route('**/api/v1/boards/b1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeBoard('Assignee', cards)) }));
  await page.route(/\/api\/v1\/cards\/[^/]+\/move/, async (route) => {
    moveCalls.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  await seedUser(page);
  const view = new BoardViewPage(page);
  await view.goto('b1');

  const card = page.getByTestId('board-card-Task Alice');
  const targetLaneColumn = page.getByTestId('board-swimlane-Bob').getByTestId('board-column-To Do');
  await card.dragTo(targetLaneColumn);

  await expect.poll(() => moveCalls.length).toBe(1);
  expect((moveCalls[0] as Record<string, string>)['targetSwimlaneKey']).toBe('Bob');
});

test('disable swimlanes via configure page → board view shows flat columns', async ({ page }) => {
  const cards = [makeCard('c1', 'Alice'), makeCard('c2', 'Bob')];
  let currentMode = 'Assignee';
  const patchCalls: unknown[] = [];

  await page.route('**/api/v1/boards/b1', async (route) => {
    if (route.request().method() === 'PATCH') {
      const body = route.request().postDataJSON();
      patchCalls.push(body);
      currentMode = (body as Record<string, string>)['swimlaneMode'] ?? currentMode;
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(makeBoard(currentMode, cards)),
      });
    }
  });

  await seedUser(page);
  const config = new BoardConfigurePage(page);
  await config.goto('b1');
  await config.swimlaneModeSelect().selectOption('None');

  await expect.poll(() => patchCalls.length).toBe(1);
  expect((patchCalls[0] as Record<string, string>)['swimlaneMode']).toBe('None');

  const view = new BoardViewPage(page);
  await view.goto('b1');

  await expect(page.getByTestId('board-view-columns')).toBeVisible();
  await expect(page.getByTestId('board-swimlane-Alice')).toBeHidden();
});
