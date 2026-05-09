// traces_to: L2-047
import { test, expect } from '@playwright/test';
import { BoardConfigurePage } from '../../pages/BoardConfigurePage';

const columns = [
  { id: 'todo', name: 'To Do', color: 'blue' },
  { id: 'inProgress', name: 'In Progress', color: 'amber' },
];
const board = { id: 'b1', name: 'Outreach Q1', description: null, columns, cards: [], swimlaneMode: 'None' };
const boardWithCards = {
  ...board,
  cards: [{ id: 'k1', columnId: 'todo', title: 'Task A', tags: [], assigneeName: null, dueDate: null }],
};

async function seedAndNavigate(
  page: import('@playwright/test').Page,
  data = board,
): Promise<void> {
  await page.route('**/api/v1/boards/b1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) }),
  );
  await page.route('**/api/v1/boards/b1/columns/**', (r) => r.fulfill({ status: 204 }));
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[]; userId?: string; cityId?: string }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ userId: 'u1', cityId: 'Toronto', roles: ['CityLead'], permissions: ['KanbanBoard:View', 'KanbanBoard:Configure'] });
  });
  await page.route('/api/v1/notifications**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
  const config = new BoardConfigurePage(page);
  await config.goto('b1');
}

test('swimlane select is wrapped in a Material form field', async ({ page }) => {
  await seedAndNavigate(page);
  const config = new BoardConfigurePage(page);
  const field = page.locator('mat-form-field').filter({ has: config.swimlaneModeSelect() });
  await expect(field).toBeVisible();
});

test('delete column button is a Material text button', async ({ page }) => {
  await seedAndNavigate(page);
  const config = new BoardConfigurePage(page);
  await expect(config.deleteColumnButton('To Do')).toHaveAttribute('mat-button');
});

test('move cards dialog appears as a Material card when column with cards is deleted', async ({ page }) => {
  await seedAndNavigate(page, boardWithCards);
  const config = new BoardConfigurePage(page);
  await config.deleteColumnButton('To Do').click();
  await expect(config.moveCardsDialog()).toBeVisible();
  await expect(config.moveCardsDialog()).toContainText('Move 1 cards');
});

test('move cards target select is wrapped in a Material form field', async ({ page }) => {
  await seedAndNavigate(page, boardWithCards);
  const config = new BoardConfigurePage(page);
  await config.deleteColumnButton('To Do').click();
  const field = page.locator('mat-form-field').filter({ has: config.moveCardsTarget() });
  await expect(field).toBeVisible();
});

test('confirm button in move cards dialog is a Material flat button', async ({ page }) => {
  await seedAndNavigate(page, boardWithCards);
  const config = new BoardConfigurePage(page);
  await config.deleteColumnButton('To Do').click();
  await expect(config.moveCardsConfirm()).toHaveAttribute('mat-flat-button');
});
