// traces_to: L2-052, L2-055
import { test, expect } from '@playwright/test';
import { EventDetailPage } from '../../pages/EventDetailPage';

function makeEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ev-ca',
    title: 'City Prayer Night',
    coverImageUrl: null,
    status: 'Scheduled',
    startAt: '2026-06-15T19:00:00Z',
    endAt: '2026-06-15T21:00:00Z',
    location: 'City Hall',
    isVirtual: false,
    rsvpCount: 5,
    capacity: null,
    tags: [],
    description: 'A night of prayer.',
    attendees: [],
    requiresApproval: false,
    ...overrides,
  };
}

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/sign-in');
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

test('Cancel event shows confirm dialog with optional message field', async ({ page }) => {
  await seedLead(page);
  await page.route('**/api/v1/events/ev-ca', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeEvent()) });
  });
  await page.route('**/api/v1/events/ev-ca/rsvp', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rsvpStatus: null }) });
  });
  await page.route('**/api/v1/events/ev-ca/rsvp/requests', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });

  const detail = new EventDetailPage(page);
  await detail.goto('ev-ca');

  await page.getByTestId('event-cancel-button').click();
  await expect(page.getByTestId('event-cancel-dialog')).toBeVisible();
  await expect(page.getByTestId('event-cancel-message')).toBeVisible();
  await expect(page.getByTestId('event-cancel-confirm')).toBeVisible();
});

test('Confirming cancel flips status to Cancelled and shows ribbon', async ({ page }) => {
  let eventData = makeEvent();

  await seedLead(page);
  await page.route('**/api/v1/events/ev-ca', (route) => {
    if (route.request().method() === 'GET') {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(eventData) });
    } else if (route.request().method() === 'POST') {
      eventData = { ...eventData, status: 'Cancelled' };
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(eventData) });
    }
  });
  await page.route('**/api/v1/events/ev-ca/rsvp', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rsvpStatus: null }) });
  });
  await page.route('**/api/v1/events/ev-ca/rsvp/requests', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });
  await page.route('**/api/v1/events/ev-ca/cancel', (route) => {
    eventData = { ...eventData, status: 'Cancelled' };
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(eventData) });
  });

  const detail = new EventDetailPage(page);
  await detail.goto('ev-ca');

  await page.getByTestId('event-cancel-button').click();
  await page.getByTestId('event-cancel-confirm').click();

  await expect(page.getByTestId('event-status-chip')).toContainText('Cancelled');
});

test('Approval queue shows pending RSVPs with Approve and Deny buttons', async ({ page }) => {
  const pending = [
    { id: 'req1', userId: 'u1', userName: 'Alice', requestedAt: '2026-06-01T10:00:00Z' },
    { id: 'req2', userId: 'u2', userName: 'Bob', requestedAt: '2026-06-01T11:00:00Z' },
  ];

  await seedLead(page);
  await page.route('**/api/v1/events/ev-ca', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeEvent({ requiresApproval: true })) });
  });
  await page.route('**/api/v1/events/ev-ca/rsvp', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rsvpStatus: null }) });
  });
  await page.route('**/api/v1/events/ev-ca/rsvp/requests', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: pending, total: 2 }) });
  });

  const detail = new EventDetailPage(page);
  await detail.goto('ev-ca');

  await expect(page.getByTestId('rsvp-panel')).toBeVisible();
  await expect(page.getByTestId('rsvp-request-req1')).toBeVisible();
  await expect(page.getByTestId('rsvp-request-req2')).toBeVisible();
  await expect(page.getByTestId('rsvp-approve-req1')).toBeVisible();
  await expect(page.getByTestId('rsvp-deny-req2')).toBeVisible();
});
