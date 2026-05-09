// traces_to: L2-047
import { test, expect, Page } from '@playwright/test';
import { BoardConfigurePage } from '../../pages/BoardConfigurePage';

interface BoardCard { id: string; columnId: string; title: string; tags: unknown[]; assigneeName: null; dueDate: null }
interface BoardColumn { id: string; name: string; color: string }
interface BoardDetail {
  id: string;
  name: string;
  description: null;
  columns: BoardColumn[];
  cards: BoardCard[];
}

const baseColumns: BoardColumn[] = [
  { id: 'todo', name: 'To Do', color: 'blue' },
  { id: 'inProgress', name: 'In Progress', color: 'amber' },
  { id: 'done', name: 'Done', color: 'green' },
];

function detail(columns: BoardColumn[], cards: BoardCard[] = []): BoardDetail {
  return { id: 'b1', name: 'Outreach Q1', description: null, columns, cards };
}

async function seed(
  page: Page,
  initial: { columns: BoardColumn[]; cards?: BoardCard[]; permissions?: string[] },
): Promise<{ orders: string[][]; deletes: { columnId: string; body: unknown }[] }> {
  const orders: string[][] = [];
  const deletes: { columnId: string; body: unknown }[] = [];
  let columns = initial.columns;
  let cards = initial.cards ?? [];

  await page.route('**/api/v1/boards/b1', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(detail(columns, cards)) }),
  );

  await page.route('**/api/v1/boards/b1/columns/order', async (route) => {
    const body = route.request().postDataJSON();
    orders.push(body.order);
    columns = (body.order as string[])
      .map((id) => columns.find((c) => c.id === id))
      .filter((c): c is BoardColumn => !!c);
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  await page.route(/\/api\/v1\/boards\/b1\/columns\/[^/]+$/, async (route) => {
    if (route.request().method() !== 'DELETE') return route.continue();
    const url = route.request().url();
    const colId = url.split('/columns/')[1];
    const body = route.request().postDataJSON() ?? {};
    deletes.push({ columnId: colId, body });
    if (typeof body.targetColumnId === 'string') {
      cards = cards.map((c) => (c.columnId === colId ? { ...c, columnId: body.targetColumnId } : c));
    }
    columns = columns.filter((c) => c.id !== colId);
    await route.fulfill({ status: 204 });
  });

  await page.goto('/sign-in');
  await page.evaluate((perms) => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[]; userId?: string; cityId?: string }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ userId: 'u1', cityId: 'Toronto', roles: ['CityLead'], permissions: perms });
  }, initial.permissions ?? ['KanbanBoard:View', 'KanbanBoard:Configure']);

  return { orders, deletes };
}

test('reorder columns via drag persists', async ({ page }) => {
  const { orders } = await seed(page, { columns: baseColumns });
  const config = new BoardConfigurePage(page);
  await config.goto('b1');

  const inProgressRow = config.columnRow('In Progress');
  const todoRow = config.columnRow('To Do');
  await inProgressRow.dragTo(todoRow);

  await expect.poll(() => orders.length).toBeGreaterThan(0);
  expect(orders[orders.length - 1][0]).toBe('inProgress');
});

test('remove column with cards prompts move dialog and confirms move', async ({ page }) => {
  const cards: BoardCard[] = [
    { id: 'k1', columnId: 'todo', title: 'A', tags: [], assigneeName: null, dueDate: null },
    { id: 'k2', columnId: 'todo', title: 'B', tags: [], assigneeName: null, dueDate: null },
  ];
  const { deletes } = await seed(page, { columns: baseColumns, cards });
  const config = new BoardConfigurePage(page);
  await config.goto('b1');

  await config.deleteColumnButton('To Do').click();
  await expect(config.moveCardsDialog()).toBeVisible();
  await expect(config.moveCardsDialog()).toContainText('Move 2 cards');

  await config.selectMoveTarget('In Progress');
  await config.moveCardsConfirm().click();

  await expect.poll(() => deletes.length).toBe(1);
  expect(deletes[0].columnId).toBe('todo');
  expect((deletes[0].body as { targetColumnId: string }).targetColumnId).toBe('inProgress');
});

test('member without KanbanBoard:Configure is redirected to /forbidden', async ({ page }) => {
  await seed(page, { columns: baseColumns, permissions: ['KanbanBoard:View'] });
  await page.goto('/boards/b1/configure');
  await expect(page).toHaveURL(/\/forbidden$/);
});
