// traces_to: L2-052, L2-055
import { test, expect } from '@playwright/test';
import { EventDetailPage } from '../../pages/EventDetailPage';

function makeEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ev1',
    title: 'City Prayer Night',
    coverImageUrl: null,
    status: 'Scheduled',
    startAt: '2026-06-15T19:00:00Z',
    endAt: '2026-06-15T21:00:00Z',
    location: 'City Hall',
    isVirtual: false,
    rsvpCount: 0,
    capacity: 10,
    tags: [],
    description: null,
    attendees: [],
    requiresApproval: false,
    ...overrides,
  };
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

test('RSVP Yes on event with available capacity shows Going status', async ({ page }) => {
  await seedLead(page);
  await page.route('**/api/v1/events/ev1', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeEvent()) });
  });
  await page.route('**/api/v1/events/ev1/rsvp', (route) => {
    if (route.request().method() === 'GET') {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rsvpStatus: null }) });
    } else if (route.request().method() === 'POST') {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rsvpStatus: 'Going', waitlistPosition: null }) });
    }
  });
  await page.route('**/api/v1/events/ev1/rsvp/requests', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });

  const detail = new EventDetailPage(page);
  await detail.goto('ev1');

  await page.getByTestId('rsvp-button-yes').click();
  await expect(page.getByTestId('rsvp-status')).toContainText('Going');
});

test('RSVP Yes on full event shows waitlist snackbar', async ({ page }) => {
  await seedLead(page);
  await page.route('**/api/v1/events/ev1', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeEvent({ rsvpCount: 10, capacity: 10 })) });
  });
  await page.route('**/api/v1/events/ev1/rsvp', (route) => {
    if (route.request().method() === 'GET') {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rsvpStatus: null }) });
    } else if (route.request().method() === 'POST') {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rsvpStatus: 'Waitlisted', waitlistPosition: 1 }) });
    }
  });
  await page.route('**/api/v1/events/ev1/rsvp/requests', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });

  const detail = new EventDetailPage(page);
  await detail.goto('ev1');

  await page.getByTestId('rsvp-button-yes').click();
  await expect(page.locator('[data-testid="snackbar"]')).toContainText("You're on the waitlist (#1)");
});

test('approval-required RSVP Yes shows pending approval snackbar', async ({ page }) => {
  await seedLead(page);
  await page.route('**/api/v1/events/ev1', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeEvent({ requiresApproval: true })) });
  });
  await page.route('**/api/v1/events/ev1/rsvp', (route) => {
    if (route.request().method() === 'GET') {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rsvpStatus: null }) });
    } else if (route.request().method() === 'POST') {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rsvpStatus: 'PendingApproval' }) });
    }
  });
  await page.route('**/api/v1/events/ev1/rsvp/requests', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });

  const detail = new EventDetailPage(page);
  await detail.goto('ev1');

  await page.getByTestId('rsvp-button-yes').click();
  await expect(page.locator('[data-testid="snackbar"]')).toContainText('The organizer will confirm');
});

test('organizer can approve pending RSVP from side panel', async ({ page }) => {
  const pendingRsvp = { id: 'req1', userId: 'u2', userName: 'Bob Chen', requestedAt: '2026-06-01T10:00:00Z' };

  await seedLead(page);
  await page.route('**/api/v1/events/ev1', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeEvent({ requiresApproval: true })) });
  });
  await page.route('**/api/v1/events/ev1/rsvp', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rsvpStatus: null }) });
  });
  await page.route('**/api/v1/events/ev1/rsvp/requests', (route) => {
    if (route.request().method() === 'GET') {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [pendingRsvp], total: 1 }) });
    } else if (route.request().method() === 'POST') {
      void route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
  });

  const detail = new EventDetailPage(page);
  await detail.goto('ev1');

  await expect(page.getByTestId('rsvp-panel')).toBeVisible();
  await expect(page.getByTestId('rsvp-request-req1')).toBeVisible();
  await page.getByTestId('rsvp-approve-req1').click();
  await expect(page.getByTestId('rsvp-request-req1')).not.toBeVisible();
});

test('cancelling RSVP from Going shows waitlist promotion snackbar', async ({ page }) => {
  await seedLead(page);
  await page.route('**/api/v1/events/ev1', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeEvent()) });
  });
  await page.route('**/api/v1/events/ev1/rsvp', (route) => {
    if (route.request().method() === 'GET') {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rsvpStatus: 'Going' }) });
    } else if (route.request().method() === 'POST') {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rsvpStatus: 'Cancelled', promotedUser: 'Alice Nguyen' }) });
    }
  });
  await page.route('**/api/v1/events/ev1/rsvp/requests', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });

  const detail = new EventDetailPage(page);
  await detail.goto('ev1');

  await expect(page.getByTestId('rsvp-status')).toContainText('Going');
  await page.getByTestId('rsvp-button-no').click();
  await expect(page.locator('[data-testid="snackbar"]')).toContainText('Alice Nguyen');
});
