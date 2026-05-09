// traces_to: L2-052, L2-053
import { test, expect } from '@playwright/test';
import { EventsListPage } from '../../pages/EventsListPage';

const scheduled = {
  id: 'e1',
  title: 'Sunday Service',
  coverImageUrl: null,
  status: 'Scheduled',
  startAt: '2026-06-15T10:00:00Z',
  endAt: '2026-06-15T12:00:00Z',
  location: '123 Main St',
  isVirtual: false,
  rsvpCount: 12,
  capacity: 50,
  tags: [],
};

const cancelled = {
  id: 'e2',
  title: 'Cancelled Event',
  coverImageUrl: null,
  status: 'Cancelled',
  startAt: '2026-05-01T10:00:00Z',
  endAt: '2026-05-01T12:00:00Z',
  location: null,
  isVirtual: true,
  rsvpCount: 0,
  capacity: null,
  tags: [],
};

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Event:Read'] });
  });
  await page.route('/api/v1/notifications**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });
}

test('empty list shows event-icon empty state', async ({ page }) => {
  await page.route('**/api/v1/events**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });

  await seedLead(page);
  const list = new EventsListPage(page);
  await list.goto();

  await expect(list.emptyState()).toBeVisible();
});

test('cancelled event card has error-container ribbon and strikethrough title', async ({ page }) => {
  await page.route('**/api/v1/events**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [cancelled], total: 1 }) });
  });

  await seedLead(page);
  const list = new EventsListPage(page);
  await list.goto();

  await expect(list.eventCard('e2')).toBeVisible();
  await expect(list.eventCard('e2').getByTestId('event-cancelled-ribbon')).toBeVisible();
  await expect(list.eventCard('e2').getByTestId('event-card-title')).toHaveCSS('text-decoration-line', 'line-through');
});

test('filter "Status=Scheduled" hides cancelled events', async ({ page }) => {
  let filterStatus = '';

  await page.route('**/api/v1/events**', (route) => {
    const url = route.request().url();
    const match = url.match(/status=([^&]+)/);
    filterStatus = match ? decodeURIComponent(match[1]) : '';
    const items = filterStatus === 'Scheduled' ? [scheduled] : [scheduled, cancelled];
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items, total: items.length }) });
  });

  await seedLead(page);
  const list = new EventsListPage(page);
  await list.goto();

  await expect(list.eventCard('e1')).toBeVisible();
  await expect(list.eventCard('e2')).toBeVisible();

  await list.statusFilter().selectOption('Scheduled');

  await expect(list.eventCard('e1')).toBeVisible();
  await expect(list.eventCard('e2')).not.toBeVisible();
});

test('toggle to Calendar swaps to calendar view', async ({ page }) => {
  await page.route('**/api/v1/events**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [scheduled], total: 1 }) });
  });

  await seedLead(page);
  const list = new EventsListPage(page);
  await list.goto();

  await list.viewToggle().click();
  await expect(list.calendarView()).toBeVisible();
});
