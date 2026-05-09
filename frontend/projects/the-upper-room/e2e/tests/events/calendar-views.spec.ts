// traces_to: L2-054
import { test, expect } from '@playwright/test';

const eventA = {
  id: 'ev1',
  title: 'Sunday Service',
  coverImageUrl: null,
  status: 'Scheduled',
  startAt: '2026-05-10T10:00:00Z',
  endAt: '2026-05-10T12:00:00Z',
  location: null,
  isVirtual: false,
  rsvpCount: 5,
  capacity: null,
  tags: [],
};

const eventB = {
  id: 'ev2',
  title: 'Prayer Night',
  coverImageUrl: null,
  status: 'Scheduled',
  startAt: '2026-05-12T19:00:00Z',
  endAt: '2026-05-12T21:00:00Z',
  location: null,
  isVirtual: false,
  rsvpCount: 3,
  capacity: null,
  tags: [],
};

async function seedAndOpenCalendar(page: import('@playwright/test').Page): Promise<void> {
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
  await page.route('**/api/v1/events**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [eventA, eventB], total: 2 }) });
  });
  await page.goto('/events');
  await page.getByTestId('events-view-toggle').click();
  await expect(page.getByTestId('calendar-month')).toBeVisible();
}

test('switch to Week shows 7-column grid with hour rows', async ({ page }) => {
  await seedAndOpenCalendar(page);

  await page.getByTestId('calendar-view-tab-week').click();
  await expect(page.getByTestId('calendar-week-view')).toBeVisible();
  await expect(page.getByTestId('calendar-hour-row-06:00')).toBeVisible();
  await expect(page.getByTestId('calendar-hour-row-23:00')).toBeVisible();

  const cols = page.locator('[data-testid^="calendar-week-col-"]');
  await expect(cols).toHaveCount(7);
});

test('drag range in Day view navigates to event create form', async ({ page }) => {
  await seedAndOpenCalendar(page);

  await page.getByTestId('calendar-view-tab-day').click();
  await expect(page.getByTestId('calendar-day-view')).toBeVisible();

  const startSlot = page.getByTestId('calendar-day-slot-08:00');
  const endSlot = page.getByTestId('calendar-day-slot-09:00');

  const b1 = await startSlot.boundingBox();
  const b2 = await endSlot.boundingBox();
  await page.mouse.move(b1!.x + b1!.width / 2, b1!.y + b1!.height / 2);
  await page.mouse.down();
  await page.mouse.move(b2!.x + b2!.width / 2, b2!.y + b2!.height / 2);
  await page.mouse.up();

  await expect(page).toHaveURL(/\/events\/new/);
});

test('Agenda view lists events in order with date headers', async ({ page }) => {
  await seedAndOpenCalendar(page);

  await page.getByTestId('calendar-view-tab-agenda').click();
  await expect(page.getByTestId('calendar-agenda-view')).toBeVisible();

  const headers = page.locator('[data-testid^="calendar-agenda-date-"]');
  await expect(headers).toHaveCount(2);

  await expect(page.getByTestId('agenda-event-ev1')).toBeVisible();
  await expect(page.getByTestId('agenda-event-ev2')).toBeVisible();

  const first = await page.getByTestId('agenda-event-ev1').boundingBox();
  const second = await page.getByTestId('agenda-event-ev2').boundingBox();
  expect(first!.y).toBeLessThan(second!.y);
});

test('selected view persists when toggling list and back to calendar', async ({ page }) => {
  await seedAndOpenCalendar(page);

  await page.getByTestId('calendar-view-tab-week').click();
  await expect(page.getByTestId('calendar-week-view')).toBeVisible();

  await page.getByTestId('events-view-toggle').click();
  await expect(page.getByTestId('calendar-week-view')).not.toBeVisible();

  await page.getByTestId('events-view-toggle').click();
  await expect(page.getByTestId('calendar-week-view')).toBeVisible();
});
