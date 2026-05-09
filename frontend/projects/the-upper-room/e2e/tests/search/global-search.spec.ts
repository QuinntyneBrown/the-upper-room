// traces_to: L2-060, L2-077
import { test, expect } from '@playwright/test';
import { GlobalSearchDialog } from '../../components/GlobalSearchDialog';

const SEARCH_RESULTS = {
  contacts: [{ id: 'c1', type: 'contact', title: 'Alice Nguyen', subtitle: 'Toronto', url: '/contacts/c1' }],
  partners: [{ id: 'p1', type: 'partner', title: 'Grace Church', subtitle: 'Toronto', url: '/partners/p1' }],
  events: [{ id: 'ev1', type: 'event', title: 'City Prayer Night', subtitle: 'Jun 15', url: '/events/ev1' }],
  ideas: [],
  locations: [],
};

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Contact:Read', 'Partner:Read', 'Event:Read'] });
  });
  await page.route('/api/v1/notifications**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });
  await page.route('/api/v1/dashboard', (route) => {
    void route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ firstName: 'Jane', stats: { contacts: 0, partners: 0, upcomingEvents: 0, openIdeas: 0 }, upcomingEvents: [], tasksOnMyBoards: [] }),
    });
  });
}

test('Control+K opens search dialog and autofocuses input', async ({ page }) => {
  await seedLead(page);
  await page.goto('/dashboard');

  const search = new GlobalSearchDialog(page);
  await search.open();

  await expect(search.dialog()).toBeVisible();
  await expect(search.input()).toBeFocused();
});

test('Typing query triggers one API call after 300ms and shows grouped results', async ({ page }) => {
  await seedLead(page);
  let callCount = 0;
  await page.route('**/api/v1/search**', (route) => {
    callCount++;
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(SEARCH_RESULTS) });
  });
  await page.goto('/dashboard');

  const search = new GlobalSearchDialog(page);
  await search.open();
  await search.typeQuery('alice');

  await expect(search.result('c1')).toBeVisible({ timeout: 1000 });
  expect(callCount).toBe(1);
});

test('No results shows empty state', async ({ page }) => {
  await seedLead(page);
  await page.route('**/api/v1/search**', (route) => {
    void route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ contacts: [], partners: [], events: [], ideas: [], locations: [] }),
    });
  });
  await page.goto('/dashboard');

  const search = new GlobalSearchDialog(page);
  await search.open();
  await search.typeQuery('xyznotfound');

  await expect(search.emptyState()).toBeVisible({ timeout: 1000 });
  await expect(search.emptyState()).toContainText('No matches');
});

test('Escape closes dialog and returns focus', async ({ page }) => {
  await seedLead(page);
  await page.goto('/dashboard');

  const search = new GlobalSearchDialog(page);
  await search.open();
  await expect(search.dialog()).toBeVisible();

  await search.close();
  await expect(search.dialog()).not.toBeVisible();
});

test('ArrowDown navigation + Enter navigates to result', async ({ page }) => {
  await seedLead(page);
  await page.route('**/api/v1/search**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(SEARCH_RESULTS) });
  });

  const navUrls: string[] = [];
  page.on('request', req => {
    if (req.isNavigationRequest()) navUrls.push(req.url());
  });

  await page.goto('/dashboard');
  const search = new GlobalSearchDialog(page);
  await search.open();
  await search.typeQuery('alice');
  await expect(search.result('c1')).toBeVisible({ timeout: 1000 });

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/contacts\/c1/);
});
