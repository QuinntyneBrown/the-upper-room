// traces_to: L2-114
import { test, expect, Page } from '@playwright/test';
import { IdeasListPage } from '../../pages/IdeasListPage';
import { BoardViewPage } from '../../pages/BoardViewPage';

interface IdeaDto {
  id: string; title: string; description: string; status: string;
  voteCount: number; hasVoted: boolean; proposedBy: string;
  createdAt: string; updatedAt: string; tags: string[];
}

async function seedUser(page: Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[]; userId?: string }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ userId: 'lead', roles: ['CityLead'], permissions: ['Idea:Read', 'Idea:Vote', 'KanbanBoard:View', 'KanbanCard:Move'] });
  });
}

test('vote 5xx → heart reverts within 500ms, snackbar shown', async ({ page }) => {
  const idea: IdeaDto = {
    id: 'i1', title: 'Build a chapel', description: '', status: 'Active',
    voteCount: 2, hasVoted: false, proposedBy: 'lead',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: [],
  };

  await page.route('**/api/v1/ideas**', (route) => {
    if (route.request().method() === 'POST' && route.request().url().includes('/vote')) {
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server error' }) });
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [idea], total: 1 }) });
    }
  });

  await seedUser(page);
  const ideas = new IdeasListPage(page);
  await ideas.goto();

  await ideas.voteButton(0).click();
  await expect(ideas.voteButton(0)).not.toHaveClass(/idea-vote--active/, { timeout: 500 });
  await expect(page.getByTestId('snackbar-message')).toContainText("Couldn't save");
});

test('idea status 5xx → status reverts, snackbar shown', async ({ page }) => {
  const ideaDetail = {
    id: 'i2', title: 'Chapel plan', description: '', status: 'Submitted',
    voteCount: 0, hasVoted: false, proposedBy: 'lead', isProposer: true,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    tags: [], notes: [],
  };

  await page.route('**/api/v1/ideas/i2', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ideaDetail) });
  });

  await page.route('**/api/v1/ideas/i2/status', (route) => {
    route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server error' }) });
  });

  await seedUser(page);
  await page.goto('/ideas/i2');

  const statusSelect = page.getByTestId('idea-status-select');
  await statusSelect.selectOption('UnderReview');

  await expect(page.getByTestId('idea-status-chip')).toHaveText('Submitted', { timeout: 1000 });
  await expect(page.getByTestId('snackbar-message')).toContainText("Couldn't save");
});

test('kanban card move 5xx → card returns to source column', async ({ page }) => {
  const todoColumn = { id: 'todo', name: 'To Do', color: 'blue' };
  const inProgressColumn = { id: 'inProgress', name: 'In Progress', color: 'amber' };
  const card = { id: 'c1', columnId: 'todo', title: 'Design logo', tags: [], assigneeName: null, dueDate: null };
  const board = { id: 'b1', name: 'Sprint', description: null, columns: [todoColumn, inProgressColumn], cards: [card] };

  await page.route('**/api/v1/boards/b1', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(board) });
  });

  await page.route(/\/api\/v1\/cards\/[^/]+\/move/, (route) => {
    route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server error' }) });
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

  const view = new BoardViewPage(page);
  await view.goto('b1');

  await view.dragCardTo('Design logo', 'In Progress');

  await expect(view.column('To Do')).toContainText('Design logo', { timeout: 1000 });
  await expect(page.getByTestId('snackbar-message')).toContainText("Couldn't save");
});
