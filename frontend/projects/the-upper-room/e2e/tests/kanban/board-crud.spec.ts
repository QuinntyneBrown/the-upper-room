// traces_to: L2-043, L2-044
import { test, expect, Page } from '@playwright/test';
import { BoardsListPage } from '../../pages/BoardsListPage';
import { CreateBoardWizard } from '../../components/CreateBoardWizard';

interface BoardListItem {
  id: string;
  name: string;
  description: string | null;
  columnCount: number;
  cardCount: number;
  lastActivityAt: string;
}

const board1: BoardListItem = {
  id: 'b1',
  name: 'Outreach Q1',
  description: 'First quarter outreach',
  columnCount: 3,
  cardCount: 0,
  lastActivityAt: '2026-04-30T12:00:00Z',
};

async function seedLead(page: Page, permissions: string[] = ['KanbanBoard:Create']): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate((perms) => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[]; userId?: string; cityId?: string }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ userId: 'u1', cityId: 'Toronto', roles: ['CityLead'], permissions: perms });
  }, permissions);
}

test('empty /boards shows prescribed empty state with view_kanban icon', async ({ page }) => {
  await page.route('**/api/v1/boards**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
  await seedLead(page);
  const boards = new BoardsListPage(page);
  await boards.goto();
  await expect(boards.emptyState()).toBeVisible();
  await expect(boards.emptyHeading()).toContainText('No boards yet');
  await expect(boards.emptyState()).toContainText('Create a board to organize your work.');
  await expect(boards.newButton()).toBeVisible();
});

test('create wizard with name "Outreach Q1" + 3 default columns shows board in list', async ({ page }) => {
  let posted = false;
  await page.route('**/api/v1/boards**', async (route) => {
    if (route.request().method() === 'POST') {
      posted = true;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(board1),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: posted ? [board1] : [], total: posted ? 1 : 0 }),
    });
  });
  await seedLead(page);
  const boards = new BoardsListPage(page);
  await boards.goto();
  await boards.newButton().click();
  const wizard = new CreateBoardWizard(page);
  await expect(wizard.root()).toBeVisible();
  await wizard.nameInput().fill('Outreach Q1');
  await wizard.descriptionInput().fill('First quarter outreach');
  await wizard.submit().click();
  await expect(boards.cardByName('Outreach Q1')).toBeVisible();
});

test('list card shows last-activity timestamp', async ({ page }) => {
  await page.route('**/api/v1/boards**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [board1], total: 1 }) }),
  );
  await seedLead(page);
  const boards = new BoardsListPage(page);
  await boards.goto();
  const card = boards.cardByName('Outreach Q1');
  await expect(card).toBeVisible();
  await expect(card.getByTestId('board-card-last-activity')).toBeVisible();
});

test('member without KanbanBoard:Create does not see New board button', async ({ page }) => {
  await page.route('**/api/v1/boards**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [board1], total: 1 }) }),
  );
  await seedLead(page, []);
  const boards = new BoardsListPage(page);
  await boards.goto();
  await expect(boards.newButton()).toHaveCount(0);
});
