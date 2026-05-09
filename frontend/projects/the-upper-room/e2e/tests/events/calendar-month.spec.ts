// traces_to: L2-054
import { test, expect } from '@playwright/test';
import { CalendarMonthPom } from '../../components/CalendarMonth';

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

function nextMonthIso(): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 7); // YYYY-MM
}

function nextMonthLabel(): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(d);
}

function currentMonthLabel(): string {
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date());
}

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
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

test("today's cell is highlighted", async ({ page }) => {
  await page.route('**/api/v1/events**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });

  await seedLead(page);
  await page.goto('/events');
  await page.getByTestId('events-view-toggle').click();

  const cal = new CalendarMonthPom(page);
  await expect(cal.calendar()).toBeVisible();
  await expect(cal.todayCell()).toBeVisible();
  await expect(cal.dayCell(todayIso())).toHaveClass(/calendar-cell--today/);
});

test('click day with +N more → popover shows all events for that day', async ({ page }) => {
  const today = new Date();
  const todayIsoStr = todayIso();

  const eventsToday = Array.from({ length: 5 }, (_, i) => ({
    id: `e${i}`,
    title: `Event ${i}`,
    coverImageUrl: null,
    status: 'Scheduled',
    startAt: today.toISOString(),
    endAt: today.toISOString(),
    location: null,
    isVirtual: false,
    rsvpCount: 0,
    capacity: null,
    tags: [],
  }));

  await page.route('**/api/v1/events**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: eventsToday, total: 5 }) });
  });

  await seedLead(page);
  await page.goto('/events');
  await page.getByTestId('events-view-toggle').click();

  const cal = new CalendarMonthPom(page);
  await cal.moreButton(todayIsoStr).click();

  await expect(cal.popover()).toBeVisible();
  await expect(cal.popover().getByText('Event 3')).toBeVisible();
  await expect(cal.popover().getByText('Event 4')).toBeVisible();
});

test('navigate to next month → month label updates and events re-load', async ({ page }) => {
  let requestedUrl = '';
  await page.route('**/api/v1/events**', (route) => {
    requestedUrl = route.request().url();
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });

  await seedLead(page);
  await page.goto('/events');
  await page.getByTestId('events-view-toggle').click();

  const cal = new CalendarMonthPom(page);
  await cal.nextButton().click();

  await expect(cal.monthLabel()).toContainText(nextMonthLabel());
  expect(requestedUrl).toContain(nextMonthIso().slice(0, 7).replace('-', '-'));
});

test('click Today while on next month → returns to current month with today selected', async ({ page }) => {
  await page.route('**/api/v1/events**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });

  await seedLead(page);
  await page.goto('/events');
  await page.getByTestId('events-view-toggle').click();

  const cal = new CalendarMonthPom(page);
  await cal.nextButton().click();
  await expect(cal.monthLabel()).toContainText(nextMonthLabel());

  await cal.todayButton().click();
  await expect(cal.monthLabel()).toContainText(currentMonthLabel());
  await expect(cal.todayCell()).toBeVisible();
});
