// traces_to: L2-043, L2-044
import { test, expect } from '@playwright/test';
import { BoardsListPage } from '../../pages/BoardsListPage';
import { CreateBoardWizard } from '../../components/CreateBoardWizard';

async function seedAndOpenWizard(page: import('@playwright/test').Page): Promise<void> {
  await page.route('**/api/v1/boards**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[]; userId?: string; cityId?: string }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ userId: 'u1', cityId: 'Toronto', roles: ['CityLead'], permissions: ['KanbanBoard:Create'] });
  });
  await page.route('/api/v1/notifications**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }),
  );
  const boards = new BoardsListPage(page);
  await boards.goto();
  await boards.newButton().click();
}

test('name input is wrapped in a Material form field', async ({ page }) => {
  await seedAndOpenWizard(page);
  const wizard = new CreateBoardWizard(page);
  const field = page.locator('mat-form-field').filter({ has: wizard.nameInput() });
  await expect(field).toBeVisible();
});

test('description input is wrapped in a Material form field', async ({ page }) => {
  await seedAndOpenWizard(page);
  const wizard = new CreateBoardWizard(page);
  const field = page.locator('mat-form-field').filter({ has: wizard.descriptionInput() });
  await expect(field).toBeVisible();
});

test('create button is a Material flat button', async ({ page }) => {
  await seedAndOpenWizard(page);
  const wizard = new CreateBoardWizard(page);
  await expect(wizard.submit()).toHaveAttribute('mat-flat-button');
});

test('cancel button is a Material text button', async ({ page }) => {
  await seedAndOpenWizard(page);
  const wizard = new CreateBoardWizard(page);
  await expect(wizard.cancel()).toHaveAttribute('mat-button');
});

test('default columns option renders as mat-checkbox', async ({ page }) => {
  await seedAndOpenWizard(page);
  await expect(page.locator('mat-checkbox').filter({ has: page.getByTestId('create-board-default-columns') })).toBeVisible();
});
