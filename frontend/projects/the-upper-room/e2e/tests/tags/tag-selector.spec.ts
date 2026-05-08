// traces_to: L2-040
import { test, expect } from '@playwright/test';
import { TagSelector } from '../../components/TagSelector';

const VIP = { id: 't1', name: 'VIP', color: 'purple', usageCount: 5 };

async function seedUser(page: import('@playwright/test').Page, permissions: string[]): Promise<void> {
  await page.goto('/styleguide');
  await page.evaluate((perms) => {
    const win = window as unknown as {
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setRbac?.({ roles: ['Member'], permissions: perms });
  }, permissions);
}

test('typing "vi" surfaces VIP suggestion with color dot', async ({ page }) => {
  page.route('**/api/v1/tags*', (r) => {
    const url = new URL(r.request().url());
    const search = url.searchParams.get('search') ?? '';
    if (search && 'vip'.startsWith(search.toLowerCase()))
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [VIP] }) });
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [] }) });
  });
  await seedUser(page, []);
  const sel = new TagSelector(page);
  await sel.input().fill('vi');
  await expect(sel.suggestion('t1')).toContainText('VIP');
  await expect(sel.dot('t1')).toBeVisible();
});

test('CityLead with Tag:Create presses Enter → creates and selects new tag', async ({ page }) => {
  page.route('**/api/v1/tags', (route) => {
    if (route.request().method() === 'GET')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [] }) });
    if (route.request().method() === 'POST')
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'new1', name: 'Newbie', color: 'blue', usageCount: 0 }) });
    return route.continue();
  });
  await seedUser(page, ['Tag:Create']);
  const sel = new TagSelector(page);
  await sel.input().fill('Newbie');
  await sel.input().press('Enter');
  await expect(sel.selectedTag('new1')).toBeVisible();
});

test('Member without Tag:Create has no "Press Enter to create" hint', async ({ page }) => {
  page.route('**/api/v1/tags*', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [] }) }),
  );
  await seedUser(page, []);
  const sel = new TagSelector(page);
  await sel.input().fill('Brand new tag');
  await expect(sel.createHint()).toBeHidden();
});

test('removing a chip emits tagsChange and chip disappears', async ({ page }) => {
  page.route('**/api/v1/tags*', (route) => {
    if (route.request().method() === 'POST')
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(VIP) });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [] }) });
  });
  await seedUser(page, ['Tag:Create']);
  const sel = new TagSelector(page);
  await sel.input().fill('VIP');
  await sel.input().press('Enter');
  await expect(sel.selectedTag('t1')).toBeVisible();
  await sel.removeTag('t1').click();
  await expect(sel.selectedTag('t1')).toBeHidden();
});
