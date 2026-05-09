// traces_to: L2-040
// Verifies TarTagSelector from domain library still works after move
import { test, expect } from '@playwright/test';
import { TagSelector } from '../../components/TagSelector';
import { ContactFormPage } from '../../pages/ContactFormPage';

async function seedAuth(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('user-token');
    win.__setRbac?.({ roles: ['Admin'], permissions: ['Tag:Create', 'Contact:Create', 'Contact:Read'] });
  });
}

test('tag selector renders on contact create form after library move', async ({ page }) => {
  await seedAuth(page);

  await page.route('/api/v1/tags**', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [] }),
    });
  });

  const form = new ContactFormPage(page);
  await form.goto();

  const selector = new TagSelector(page);
  await expect(selector.root()).toBeVisible();
  await expect(selector.input()).toBeVisible();
});

test('tag suggestion appears when typing', async ({ page }) => {
  await seedAuth(page);

  const testTag = { id: 'tag-1', name: 'TestTag', color: 'blue', usageCount: 1 };

  await page.route('/api/v1/tags**', (route) => {
    const url = new URL(route.request().url());
    const search = url.searchParams.get('search') ?? '';
    const items = search.length > 0 ? [testTag] : [];
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items }),
    });
  });

  const form = new ContactFormPage(page);
  await form.goto();

  const selector = new TagSelector(page);
  await selector.input().fill('Test');
  await page.waitForTimeout(300);

  await expect(selector.suggestion(testTag.id)).toBeVisible();
});
