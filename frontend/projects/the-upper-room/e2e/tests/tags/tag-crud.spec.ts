// traces_to: L2-038, L2-039
import { test, expect } from '@playwright/test';
import { TagsPage } from '../../pages/TagsPage';

const VIP = { id: 't1', name: 'VIP', color: 'purple', usageCount: 0 };

async function seedAdmin(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('admin');
    win.__setRbac?.({ roles: ['SystemAdmin'], permissions: ['Tag:Manage'] });
  });
}

test('create VIP with color purple → chip appears in Purple group', async ({ page }) => {
  page.route('**/api/v1/tags', (route) => {
    if (route.request().method() === 'GET')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [] }) });
    if (route.request().method() === 'POST')
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(VIP) });
    return route.continue();
  });
  await seedAdmin(page);
  const tags = new TagsPage(page);
  await tags.goto();
  await tags.nameInput().fill('VIP');
  await tags.colorSelect().selectOption('purple');
  await tags.createButton().click();
  await expect(tags.group('purple')).toBeVisible();
  await expect(tags.chip('t1')).toContainText('VIP');
});

test('duplicate name → 409 error shown', async ({ page }) => {
  page.route('**/api/v1/tags', (route) => {
    if (route.request().method() === 'GET')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [VIP] }) });
    if (route.request().method() === 'POST')
      return route.fulfill({
        status: 409, contentType: 'application/problem+json',
        body: JSON.stringify({ code: 'validation.duplicate' }),
      });
    return route.continue();
  });
  await seedAdmin(page);
  const tags = new TagsPage(page);
  await tags.goto();
  await tags.nameInput().fill('VIP');
  await tags.colorSelect().selectOption('purple');
  await tags.createButton().click();
  await expect(tags.nameError()).toBeVisible();
});

test('edit color → chip moves to new color group', async ({ page }) => {
  page.route('**/api/v1/tags', (route) => {
    if (route.request().method() === 'GET')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [VIP] }) });
    return route.continue();
  });
  page.route('**/api/v1/tags/t1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...VIP, color: 'red' }) }),
  );
  await seedAdmin(page);
  const tags = new TagsPage(page);
  await tags.goto();
  await tags.editButton('t1').click();
  await tags.editColorSelect('t1').selectOption('red');
  await tags.saveEditButton('t1').click();
  await expect(tags.group('red')).toBeVisible();
  await expect(tags.chip('t1')).toBeVisible();
});

test('delete tag → confirmation → chip removed', async ({ page }) => {
  page.route('**/api/v1/tags', (route) => {
    if (route.request().method() === 'GET')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [VIP] }) });
    return route.continue();
  });
  page.route('**/api/v1/tags/t1', (r) =>
    r.fulfill({ status: 204, body: '' }),
  );
  await seedAdmin(page);
  const tags = new TagsPage(page);
  await tags.goto();
  await tags.deleteButton('t1').click();
  await expect(page.getByTestId('confirm-dialog')).toBeVisible();
  await page.getByTestId('confirm-button').click();
  await expect(tags.chip('t1')).toBeHidden();
});
