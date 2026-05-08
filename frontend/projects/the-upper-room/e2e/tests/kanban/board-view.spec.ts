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

const detail: BoardDetail = {
  id: 'b1',
  name: 'Outreach Q1',
  description: 'First quarter outreach',
  columns: [
    { id: 'c1', name: 'Backlog', color: 'blue' },
    { id: 'c2', name: 'In Progress', color: 'amber' },
    { id: 'c3', name: 'Review', color: 'purple' },
    { id: 'c4', name: 'Done', color: 'green' },
  ],
  cards: [
    { id: 'k1', columnId: 'c1', title: 'Plan kickoff', tags: [{ id: 't1', name: 'VIP', color: 'purple' }], assigneeName: 'Alice', dueDate: '2026-06-01' },
    { id: 'k2', columnId: 'c1', title: 'Draft outreach copy', tags: [], assigneeName: null, dueDate: null },
    { id: 'k3', columnId: 'c2', title: 'Email partner list', tags: [{ id: 't1', name: 'VIP', color: 'purple' }, { id: 't2', name: 'Q1', color: 'blue' }, { id: 't3', name: 'New', color: 'green' }], assigneeName: 'Bob', dueDate: '2026-06-15' },
    { id: 'k4', columnId: 'c2', title: 'Schedule meetings', tags: [], assigneeName: 'Carol', dueDate: null },
    { id: 'k5', columnId: 'c3', title: 'Review sponsorship deck', tags: [{ id: 't2', name: 'Q1', color: 'blue' }], assigneeName: null, dueDate: '2026-06-30' },
    { id: 'k6', columnId: 'c3', title: 'Approve budget', tags: [], assigneeName: 'Alice', dueDate: null },
    { id: 'k7', columnId: 'c4', title: 'Confirm venue', tags: [], assigneeName: 'Bob', dueDate: '2026-05-20' },
    { id: 'k8', columnId: 'c4', title: 'Send announcement', tags: [{ id: 't1', name: 'VIP', color: 'purple' }], assigneeName: 'Carol', dueDate: null },
  ],
};

async function seedLeadAndRoute(page: Page): Promise<void> {
  await page.route('**/api/v1/boards/b1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(detail) }),
  );
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[]; userId?: string; cityId?: string }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ userId: 'u1', cityId: 'Toronto', roles: ['CityLead'], permissions: ['KanbanBoard:View'] });
  });
}

test('board with 4 columns + 8 cards renders all elements', async ({ page }) => {
  await seedLeadAndRoute(page);
  const view = new BoardViewPage(page);
  await view.goto('b1');
  await expect(view.header()).toContainText('Outreach Q1');
  for (const col of detail.columns) {
    await expect(view.column(col.name)).toBeVisible();
  }
  for (const card of detail.cards) {
    await expect(view.card(card.title)).toBeVisible();
  }
});

test('each card shows title, up to 2 tag chips, assignee avatar, due date', async ({ page }) => {
  await seedLeadAndRoute(page);
  const view = new BoardViewPage(page);
  await view.goto('b1');
  const k3 = view.card('Email partner list');
  await expect(k3).toContainText('Email partner list');
  await expect(k3.getByTestId('card-tag')).toHaveCount(2);
  await expect(k3.getByTestId('card-assignee')).toBeVisible();
  await expect(k3.getByTestId('card-due-date')).toContainText('Jun');
});

test('at MD+ columns are horizontally scrollable', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await seedLeadAndRoute(page);
  const view = new BoardViewPage(page);
  await view.goto('b1');
  const columns = view.columnsContainer();
  await expect(columns).toBeVisible();
  const overflow = await columns.evaluate((el) => getComputedStyle(el).overflowX);
  expect(overflow).toBe('auto');
});

test('filter chip "Tag=VIP" filters card visibility per column', async ({ page }) => {
  await seedLeadAndRoute(page);
  const view = new BoardViewPage(page);
  await view.goto('b1');
  await view.tagFilterChip('VIP').click();
  await expect(view.card('Plan kickoff')).toBeVisible();
  await expect(view.card('Email partner list')).toBeVisible();
  await expect(view.card('Send announcement')).toBeVisible();
  await expect(view.card('Draft outreach copy')).toHaveCount(0);
  await expect(view.card('Approve budget')).toHaveCount(0);
});
