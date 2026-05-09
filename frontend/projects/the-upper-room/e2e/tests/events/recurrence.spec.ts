// traces_to: L2-056
import { test, expect } from '@playwright/test';

function makeMondays(count: number, titleBase = 'Weekly Prayer'): object[] {
  // First Monday on or after 2026-05-11
  const base = new Date('2026-05-11T19:00:00Z');
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i * 7);
    return {
      id: `rec-mon-${i}`,
      title: titleBase,
      coverImageUrl: null,
      status: 'Scheduled',
      startAt: d.toISOString(),
      endAt: new Date(d.getTime() + 2 * 3600 * 1000).toISOString(),
      location: null,
      isVirtual: false,
      rsvpCount: 0,
      capacity: null,
      tags: [],
      recurrenceId: 'rec-parent',
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO;COUNT=12',
    };
  });
}

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Event:Read', 'Event:Manage'] });
  });
  await page.route('/api/v1/notifications**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });
}

test('Weekly recurrence: calendar renders all 12 Monday occurrences', async ({ page }) => {
  const occurrences = makeMondays(12);
  await seedLead(page);
  await page.route('**/api/v1/events**', (route) => {
    void route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ items: occurrences, total: occurrences.length }),
    });
  });

  await page.goto('/events');
  await page.getByTestId('events-toggle-view').click();

  const eventChips = page.locator('.calendar-cell__event');
  await expect(eventChips).toHaveCount(12);
});

test('Editing recurring occurrence shows edit scope dialog', async ({ page }) => {
  const parentEvent = {
    id: 'rec-parent',
    title: 'Weekly Prayer',
    coverImageUrl: null,
    status: 'Scheduled',
    startAt: '2026-05-11T19:00:00Z',
    endAt: '2026-05-11T21:00:00Z',
    location: null,
    isVirtual: false,
    rsvpCount: 0,
    capacity: null,
    tags: [],
    description: null,
    attendees: [],
    requiresApproval: false,
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO;COUNT=12',
    recurrenceId: 'rec-parent',
    occurrenceDate: '2026-05-18',
  };

  await seedLead(page);
  await page.route('**/api/v1/events/rec-parent', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(parentEvent) });
  });

  await page.goto('/events/rec-parent/edit');
  await expect(page.getByTestId('recurrence-edit-dialog')).toBeVisible();
  await expect(page.getByTestId('recurrence-edit-single')).toBeVisible();
  await expect(page.getByTestId('recurrence-edit-following')).toBeVisible();
  await expect(page.getByTestId('recurrence-edit-series')).toBeVisible();
});

test('Choosing This event only from edit dialog dismisses dialog and shows form', async ({ page }) => {
  const recurringEvent = {
    id: 'rec-parent',
    title: 'Weekly Prayer',
    coverImageUrl: null,
    status: 'Scheduled',
    startAt: '2026-05-11T19:00:00Z',
    endAt: '2026-05-11T21:00:00Z',
    location: null,
    isVirtual: false,
    rsvpCount: 0,
    capacity: null,
    tags: [],
    description: null,
    attendees: [],
    requiresApproval: false,
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO;COUNT=12',
    recurrenceId: 'rec-parent',
  };

  await seedLead(page);
  await page.route('**/api/v1/events/rec-parent', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(recurringEvent) });
  });

  await page.goto('/events/rec-parent/edit');
  await page.getByTestId('recurrence-edit-single').click();
  await expect(page.getByTestId('recurrence-edit-dialog')).not.toBeVisible();
  await expect(page.getByTestId('event-form-title')).toBeVisible();
});

test('Series spanning DST boundary: occurrences show consistent 7pm time', async ({ page }) => {
  // March DST: clocks spring forward. Events should still show at 7pm each week.
  const dstOccurrences = [
    '2026-03-02T19:00:00Z', // before DST
    '2026-03-09T19:00:00Z', // before DST
    '2026-03-16T19:00:00Z', // after DST (clocks sprang forward Mar 8)
    '2026-03-23T19:00:00Z', // after DST
  ].map((startAt, i) => ({
    id: `dst-${i}`,
    title: 'Monday Night',
    coverImageUrl: null,
    status: 'Scheduled',
    startAt,
    endAt: new Date(new Date(startAt).getTime() + 2 * 3600 * 1000).toISOString(),
    location: null,
    isVirtual: false,
    rsvpCount: 0,
    capacity: null,
    tags: [],
    recurrenceId: 'dst-parent',
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO;COUNT=4',
  }));

  await seedLead(page);
  await page.route('**/api/v1/events**', (route) => {
    void route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ items: dstOccurrences, total: dstOccurrences.length }),
    });
  });

  await page.goto('/events');
  await page.getByTestId('events-toggle-view').click();
  await page.getByTestId('calendar-view-tab-agenda').click();

  const eventTimes = page.locator('.calendar-agenda__event-time');
  await expect(eventTimes).toHaveCount(4);
  const times = await eventTimes.allTextContents();
  // All occurrences stored as UTC 19:00, so agenda shows "19:00" for all
  expect(times.every(t => t.trim() === '19:00')).toBe(true);
});
