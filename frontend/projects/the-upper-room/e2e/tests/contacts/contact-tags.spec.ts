// traces_to: L2-029
import { test, expect } from '@playwright/test';
import { ContactFormPage } from '../../pages/ContactFormPage';
import { TagSelector } from '../../components/TagSelector';

const VIP = { id: 't1', name: 'VIP', color: 'purple', usageCount: 5 };
const SPONSOR = { id: 't2', name: 'Sponsor', color: 'blue', usageCount: 2 };

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Contact:Create', 'Tag:Create'] });
  });
}

test('add VIP and Sponsor tags → saved contact has both chips', async ({ page }) => {
  let savedTags: unknown[] = [];
  await page.route('**/api/v1/tags*', (r) => {
    const url = new URL(r.request().url());
    const q = url.searchParams.get('search') ?? '';
    const items = [VIP, SPONSOR].filter((t) => t.name.toLowerCase().includes(q.toLowerCase()));
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items }) });
  });
  await page.route('**/api/v1/contacts', (r) => {
    if (r.request().method() === 'POST') {
      savedTags = JSON.parse(r.request().postData() ?? '{}').tags ?? [];
      return r.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'c1', name: 'Bob', cityId: 'Toronto' }) });
    }
    return r.continue();
  });
  await seedLead(page);
  const form = new ContactFormPage(page);
  await form.goto();
  await form.firstName().fill('Bob');
  const tagSel = new TagSelector(page);
  await tagSel.input().fill('VIP');
  await tagSel.suggestion('t1').click();
  await tagSel.input().fill('Sponsor');
  await tagSel.suggestion('t2').click();
  await form.submit().click();
  expect(savedTags).toHaveLength(2);
});

test('removing a tag in form clears it from selection', async ({ page }) => {
  await page.route('**/api/v1/tags*', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [VIP] }) }),
  );
  await page.route('**/api/v1/contacts', (r) => {
    if (r.request().method() === 'POST')
      return r.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'c1', name: 'Bob', cityId: 'Toronto' }) });
    return r.continue();
  });
  await seedLead(page);
  const form = new ContactFormPage(page);
  await form.goto();
  await form.firstName().fill('Bob');
  const tagSel = new TagSelector(page);
  await tagSel.input().fill('VIP');
  await tagSel.suggestion('t1').click();
  await expect(tagSel.selectedTag('t1')).toBeVisible();
  await tagSel.removeTag('t1').click();
  await expect(tagSel.selectedTag('t1')).toBeHidden();
});
