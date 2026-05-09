// traces_to: L2-045
import { test, expect } from '@playwright/test';

const todoColumn = { id: 'todo', name: 'To Do', color: 'blue' };
const inProgressColumn = { id: 'inProgress', name: 'In Progress', color: 'amber' };
const doneColumn = { id: 'done', name: 'Done', color: 'green' };

const board = {
  id: 'b1', name: 'Test Board', description: null,
  columns: [todoColumn, inProgressColumn, doneColumn],
  cards: [{ id: 'c1', columnId: 'todo', title: 'My Card', tags: [], assigneeName: null, dueDate: null, swimlaneKey: null }],
  swimlaneMode: 'None',
};

async function seedBoard(page: import('@playwright/test').Page): Promise<void> {
  await page.route('**/api/v1/boards/b1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(board) }));
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['KanbanBoard:View', 'KanbanCard:Move'] });
  });
}

test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

test('at 375px viewport only one column visible at a time; scroll moves to next', async ({ page }) => {
  await seedBoard(page);
  await page.goto('/boards/b1');

  const columns = page.getByTestId('board-view-columns');
  await expect(columns).toBeVisible();

  const todoCol = page.getByTestId('board-column-To Do');
  const inProgressCol = page.getByTestId('board-column-In Progress');

  await expect(todoCol).toBeInViewport();
  await expect(inProgressCol).not.toBeInViewport();

  await page.evaluate(() => {
    const container = document.querySelector('[data-testid="board-view-columns"]')!;
    container.scrollTo({ left: (container as HTMLElement).offsetWidth, behavior: 'instant' });
  });

  await expect(inProgressCol).toBeInViewport();
  await expect(todoCol).not.toBeInViewport();
});

test('dot indicators reflect current column index', async ({ page }) => {
  await seedBoard(page);
  await page.goto('/boards/b1');

  const indicators = page.getByTestId('board-column-indicators');
  await expect(indicators).toBeVisible();

  await expect(page.getByTestId('board-column-dot-0')).toHaveAttribute('aria-current', 'true');
  await expect(page.getByTestId('board-column-dot-1')).not.toHaveAttribute('aria-current', 'true');

  await page.evaluate(() => {
    const container = document.querySelector('[data-testid="board-view-columns"]')!;
    container.scrollTo({ left: (container as HTMLElement).offsetWidth, behavior: 'instant' });
    container.dispatchEvent(new Event('scroll'));
  });

  await expect.poll(async () =>
    await page.getByTestId('board-column-dot-1').getAttribute('aria-current')
  ).toBe('true');
  await expect(page.getByTestId('board-column-dot-0')).not.toHaveAttribute('aria-current', 'true');
});

test('touch drag on card opens Move-to sheet instead of HTML5 drag', async ({ page }) => {
  await seedBoard(page);
  await page.route(/\/api\/v1\/cards\/[^/]+\/move/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.goto('/boards/b1');

  const card = page.getByTestId('board-card-My Card');
  const cardBox = await card.boundingBox();
  if (!cardBox) throw new Error('card not found');

  await page.touchscreen.tap(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
  await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + 50, { steps: 5 });

  await expect(page.getByTestId('board-move-sheet')).toBeVisible();
  await expect(page.getByTestId('board-move-sheet-option-In Progress')).toBeVisible();
  await expect(page.getByTestId('board-move-sheet-option-Done')).toBeVisible();
});
