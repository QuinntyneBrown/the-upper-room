// traces_to: L2-046
import { test, expect, Page } from '@playwright/test';
import { BoardViewPage } from '../../pages/BoardViewPage';
import { CardDetailDialog } from '../../components/CardDetailDialog';

interface CardSchemaField {
  key: string;
  label: string;
  type: 'text';
  required: boolean;
}

interface BoardCard {
  id: string;
  columnId: string;
  title: string;
  tags: { id: string; name: string; color: string }[];
  assigneeName: string | null;
  dueDate: string | null;
  data?: Record<string, string | null>;
}

interface BoardDetail {
  id: string;
  name: string;
  description: string | null;
  columns: { id: string; name: string; color: string; wipLimit?: number }[];
  cardSchema: CardSchemaField[];
  cards: BoardCard[];
}

const detail: BoardDetail = {
  id: 'b1',
  name: 'Outreach Q1',
  description: null,
  columns: [{ id: 'todo', name: 'To Do', color: 'blue' }],
  cardSchema: [
    { key: 'priority', label: 'Priority', type: 'text', required: true },
    { key: 'effort', label: 'Effort', type: 'text', required: false },
  ],
  cards: [
    {
      id: 'card-1',
      columnId: 'todo',
      title: 'Plan kickoff',
      tags: [],
      assigneeName: null,
      dueDate: null,
      data: { priority: 'High', effort: 'Medium' },
    },
  ],
};

async function seed(page: Page): Promise<{ patches: { id: string; body: unknown }[] }> {
  const patches: { id: string; body: unknown }[] = [];
  const state = JSON.parse(JSON.stringify(detail)) as BoardDetail;

  await page.route('**/api/v1/boards/b1', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(state) }),
  );

  await page.route(/\/api\/v1\/cards\/[^/]+$/, async (route) => {
    if (route.request().method() !== 'PATCH') return route.continue();
    const url = route.request().url();
    const cardId = url.split('/cards/')[1];
    const body = route.request().postDataJSON();
    patches.push({ id: cardId, body });
    const card = state.cards.find((c) => c.id === cardId);
    if (card) Object.assign(card, body);
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(card) });
  });

  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[]; userId?: string; cityId?: string }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ userId: 'u1', cityId: 'Toronto', roles: ['CityLead'], permissions: ['KanbanBoard:View', 'KanbanCard:Update'] });
  });

  return { patches };
}

test('clicking card opens dialog with schema-defined fields', async ({ page }) => {
  await seed(page);
  const view = new BoardViewPage(page);
  await view.goto('b1');
  await view.card('Plan kickoff').click();
  const dialog = new CardDetailDialog(page);
  await expect(dialog.root()).toBeVisible();
  await expect(dialog.schemaField('priority')).toBeVisible();
  await expect(dialog.schemaField('effort')).toBeVisible();
});

test('clearing a required field then closing blocks close with inline error', async ({ page }) => {
  await seed(page);
  const view = new BoardViewPage(page);
  await view.goto('b1');
  await view.card('Plan kickoff').click();
  const dialog = new CardDetailDialog(page);
  await dialog.schemaField('priority').fill('');
  await dialog.closeButton().click();
  await expect(dialog.root()).toBeVisible();
  await expect(dialog.fieldError('priority')).toContainText('Priority is required');
});

test('add a comment locally renders in comments list', async ({ page }) => {
  await seed(page);
  const view = new BoardViewPage(page);
  await view.goto('b1');
  await view.card('Plan kickoff').click();
  const dialog = new CardDetailDialog(page);
  await dialog.commentInput().fill('Reviewed scope.');
  await dialog.addCommentButton().click();
  await expect(dialog.commentsList()).toContainText('Reviewed scope.');
});

test('attaching a 3MB PDF appears in attachments list', async ({ page }) => {
  await seed(page);
  const view = new BoardViewPage(page);
  await view.goto('b1');
  await view.card('Plan kickoff').click();
  const dialog = new CardDetailDialog(page);

  const buffer = Buffer.alloc(3 * 1024 * 1024, 0x25);
  await dialog.attachmentInput().setInputFiles({ name: 'brief.pdf', mimeType: 'application/pdf', buffer });
  await expect(dialog.attachmentsList()).toContainText('brief.pdf');
});

test('inline title edit + blur persists via PATCH', async ({ page }) => {
  const { patches } = await seed(page);
  const view = new BoardViewPage(page);
  await view.goto('b1');
  await view.card('Plan kickoff').click();
  const dialog = new CardDetailDialog(page);
  await dialog.title().fill('Plan kickoff (revised)');
  await dialog.title().press('Tab');
  await expect.poll(() => patches.length).toBe(1);
  expect((patches[0].body as { title: string }).title).toBe('Plan kickoff (revised)');
});
