// traces_to: L2-119
import { test, expect } from '@playwright/test';

const seedContact = {
  id: 'print-c1',
  name: 'Print Test User',
  title: 'Pastor',
  org: 'Grace Church',
  phones: [{ value: '+14165550100', label: 'Mobile', primary: true }],
  emails: [{ value: 'print@grace.org', label: 'Work', primary: true }],
  tags: [{ id: 't1', name: 'VIP', color: 'purple', usageCount: 0 }],
  archived: false,
};

async function seedUser(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Contact:Create'] });
  });
}

test('app shell chrome is hidden in print', async ({ page }) => {
  await page.route('**/api/v1/contacts/print-c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(seedContact) }),
  );
  await seedUser(page);
  await page.goto('/contacts/print-c1');
  await page.emulateMedia({ media: 'print' });

  const topBar = page.locator('.app-shell__top-bar');
  const drawer = page.locator('.app-shell__drawer');
  const fab = page.locator('.fab');

  await expect(topBar).toBeHidden();
  await expect(drawer).toBeHidden();
  await expect(fab).toBeHidden();
});

test('body text is black on white in print', async ({ page }) => {
  await page.route('**/api/v1/contacts/print-c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(seedContact) }),
  );
  await seedUser(page);
  await page.goto('/contacts/print-c1');
  await page.emulateMedia({ media: 'print' });

  const bodyColor = await page.evaluate(() => getComputedStyle(document.body).color);
  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

  expect(bodyColor).toBe('rgb(0, 0, 0)');
  expect(bodyBg).toBe('rgb(255, 255, 255)');
});

test('tag chips render without colored backgrounds in print', async ({ page }) => {
  await page.route('**/api/v1/contacts/print-c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(seedContact) }),
  );
  await seedUser(page);
  await page.goto('/contacts/print-c1');
  await page.emulateMedia({ media: 'print' });

  const chip = page.locator('.tag-chip').first();
  await expect(chip).toBeVisible();
  const bg = await chip.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).toBe('rgba(0, 0, 0, 0)');
});

test('contact basic info is visible in print', async ({ page }) => {
  await page.route('**/api/v1/contacts/print-c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(seedContact) }),
  );
  await seedUser(page);
  await page.goto('/contacts/print-c1');
  await page.emulateMedia({ media: 'print' });

  await expect(page.locator('h1')).toContainText('Print Test User');
  await expect(page.getByTestId('contact-detail-phones')).toBeVisible();
  await expect(page.getByTestId('contact-detail-emails')).toBeVisible();
});
