// traces_to: L2-046
import { test, expect, Page } from '@playwright/test';
import { BoardViewPage } from '../../pages/BoardViewPage';
import { CardDetailDialog } from '../../components/CardDetailDialog';

const detail = {
  id: 'b1',
  name: 'Outreach Q1',
  description: null,
  columns: [{ id: 'todo', name: 'To Do', color: 'blue' }],
  cardSchema: [{ key: 'priority', label: 'Priority', type: 'text', required: true }],
  cards: [{ id: 'card-1', columnId: 'todo', title: 'Plan kickoff', tags: [], assigneeName: null, dueDate: null, data: { priority: 'High' } }],
};

async function seed(page: Page): Promise<void> {
  await page.route('**/api/v1/boards/b1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(detail) }),
  );
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[]; userId?: string; cityId?: string }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ userId: 'u1', cityId: 'Toronto', roles: ['CityLead'], permissions: ['KanbanBoard:View', 'KanbanCard:Update'] });
  });
  await page.route('/api/v1/notifications**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
}

async function openCard(page: Page): Promise<CardDetailDialog> {
  const view = new BoardViewPage(page);
  await view.goto('b1');
  await view.card('Plan kickoff').click();
  return new CardDetailDialog(page);
}

test('title input is wrapped in a Material form field', async ({ page }) => {
  await seed(page);
  const dialog = await openCard(page);
  await expect(dialog.root()).toBeVisible();
  const field = page.locator('mat-form-field').filter({ has: dialog.title() });
  await expect(field).toBeVisible();
});

test('archive button is a Material text button', async ({ page }) => {
  await seed(page);
  const dialog = await openCard(page);
  await expect(dialog.archiveButton()).toHaveAttribute('mat-button');
});

test('delete button is a Material text button', async ({ page }) => {
  await seed(page);
  const dialog = await openCard(page);
  await expect(dialog.deleteButton()).toHaveAttribute('mat-button');
});

test('close button is a Material icon button', async ({ page }) => {
  await seed(page);
  const dialog = await openCard(page);
  await expect(dialog.closeButton()).toHaveAttribute('mat-icon-button');
});

test('schema field is wrapped in a Material form field', async ({ page }) => {
  await seed(page);
  const dialog = await openCard(page);
  const field = page.locator('mat-form-field').filter({ has: dialog.schemaField('priority') });
  await expect(field).toBeVisible();
});

test('add comment button is a Material flat button', async ({ page }) => {
  await seed(page);
  const dialog = await openCard(page);
  await expect(dialog.addCommentButton()).toHaveAttribute('mat-flat-button');
});
