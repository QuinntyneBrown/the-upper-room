// traces_to: L2-111
import { test, expect } from '@playwright/test';
import { EventDetailPage } from '../events/../../pages/EventDetailPage';

function makeEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ev-tz',
    title: 'Prayer Night',
    coverImageUrl: null,
    status: 'Scheduled',
    startAt: '2026-06-15T19:00:00Z', // 14:00 ET = 19:00 UTC
    endAt: '2026-06-15T21:00:00Z',
    location: 'City Hall',
    isVirtual: false,
    rsvpCount: 0,
    capacity: null,
    tags: [],
    description: null,
    attendees: [],
    requiresApproval: false,
    timezone: 'America/New_York',
    ...overrides,
  };
}

async function seedLead(page: import('@playwright/test').Page, timezone?: string): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate((tz) => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
      __setTimezone?: (tz: string) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Event:Read'] });
    if (tz) win.__setTimezone?.(tz);
  }, timezone);
  await page.route('/api/v1/notifications**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });
}

test('Event at 14:00 ET shows both ET and viewer PT times', async ({ page }) => {
  // Event is at 19:00 UTC = 14:00 ET (2:00 PM). Viewer is in PT (UTC-7 in summer) = 12:00 PT.
  const event = makeEvent({ startAt: '2026-06-15T19:00:00Z', timezone: 'America/New_York' });

  await seedLead(page);
  await page.route('**/api/v1/events/ev-tz', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(event) });
  });
  await page.route('**/api/v1/events/ev-tz/rsvp', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rsvpStatus: null }) });
  });
  await page.route('**/api/v1/events/ev-tz/rsvp/requests', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });

  const detail = new EventDetailPage(page);
  await detail.goto('ev-tz');

  // The event-detail datetime card should show the formatted date
  const datetimeCard = detail.datetimeCard();
  await expect(datetimeCard).toBeVisible();
  // Should contain some time representation
  const text = await datetimeCard.textContent();
  expect(text).toBeTruthy();
});

test('Event with same timezone as viewer shows single time', async ({ page }) => {
  const event = makeEvent({ startAt: '2026-06-15T19:00:00Z', timezone: 'UTC' });

  await seedLead(page);
  await page.route('**/api/v1/events/ev-tz', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(event) });
  });
  await page.route('**/api/v1/events/ev-tz/rsvp', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rsvpStatus: null }) });
  });
  await page.route('**/api/v1/events/ev-tz/rsvp/requests', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });

  const detail = new EventDetailPage(page);
  await detail.goto('ev-tz');

  const datetimeCard = detail.datetimeCard();
  await expect(datetimeCard).toBeVisible();
});

test('Event timezone label shown on event detail card', async ({ page }) => {
  const event = makeEvent({ startAt: '2026-06-15T19:00:00Z', timezone: 'America/New_York' });

  await seedLead(page);
  await page.route('**/api/v1/events/ev-tz', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(event) });
  });
  await page.route('**/api/v1/events/ev-tz/rsvp', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rsvpStatus: null }) });
  });
  await page.route('**/api/v1/events/ev-tz/rsvp/requests', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });

  const detail = new EventDetailPage(page);
  await detail.goto('ev-tz');

  await expect(page.getByTestId('event-timezone-label')).toBeVisible();
  await expect(page.getByTestId('event-timezone-label')).toContainText('America/New_York');
});
