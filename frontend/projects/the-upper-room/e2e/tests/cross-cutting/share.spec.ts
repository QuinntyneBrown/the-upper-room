// traces_to: L2-118
import { test, expect } from '@playwright/test';

const seedContact = {
  id: 'share-c1',
  name: 'Share Test User',
  phones: [],
  emails: [],
  tags: [],
  archived: false,
};

async function seedUser(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Contact:Create'] });
  });
}

test('share copies URL to clipboard when Web Share API unavailable', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.route('**/api/v1/contacts/share-c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(seedContact) }),
  );
  await seedUser(page);
  await page.goto('/contacts/share-c1');

  await page.evaluate(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, writable: true });
  });

  await page.getByTestId('share-button').click();

  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('/contacts/share-c1');
});

test('snackbar shows "Link copied to clipboard." after share', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.route('**/api/v1/contacts/share-c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(seedContact) }),
  );
  await seedUser(page);
  await page.goto('/contacts/share-c1');

  await page.evaluate(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, writable: true });
  });

  await page.getByTestId('share-button').click();

  await expect(page.locator('tar-snackbar')).toContainText('Link copied to clipboard.');
});

test('Web Share API is called when available', async ({ page }) => {
  await page.route('**/api/v1/contacts/share-c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(seedContact) }),
  );
  await seedUser(page);
  await page.goto('/contacts/share-c1');

  let shareCalled = false;
  await page.evaluate(() => {
    (navigator as unknown as { share: (d: object) => Promise<void> }).share = async () => {
      (window as unknown as { __shareCalled: boolean }).__shareCalled = true;
    };
  });

  await page.getByTestId('share-button').click();

  shareCalled = await page.evaluate(() => !!(window as unknown as { __shareCalled?: boolean }).__shareCalled);
  expect(shareCalled).toBe(true);
});
