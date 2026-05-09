// traces_to: L2-055
import { test, expect } from '@playwright/test';
import { EventDetailPage } from '../../pages/EventDetailPage';

const detailEvent = {
  id: 'ev1',
  title: 'City Prayer Night',
  coverImageUrl: null,
  status: 'Scheduled',
  startAt: '2026-06-15T19:00:00Z',
  endAt: '2026-06-15T21:00:00Z',
  location: 'City Hall, Toronto',
  isVirtual: false,
  rsvpCount: 8,
  capacity: 100,
  tags: [],
  description: 'A night of prayer for our city.',
  attendees: [
    { id: 'a1', name: 'Alice Nguyen', avatarUrl: null, rsvpStatus: 'Accepted' },
    { id: 'a2', name: 'Bob Chen', avatarUrl: null, rsvpStatus: 'Accepted' },
    { id: 'a3', name: 'Carol Davis', avatarUrl: null, rsvpStatus: 'Accepted' },
    { id: 'a4', name: 'Dan Park', avatarUrl: null, rsvpStatus: 'Accepted' },
    { id: 'a5', name: 'Eve Okafor', avatarUrl: null, rsvpStatus: 'Accepted' },
    { id: 'a6', name: 'Frank Lee', avatarUrl: null, rsvpStatus: 'Pending' },
  ],
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
  await page.route('**/api/v1/events/ev1', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(detailEvent) });
  });
}

test('status chip shows "Scheduled" with data-status attribute', async ({ page }) => {
  await seedLead(page);
  const detail = new EventDetailPage(page);
  await detail.goto('ev1');

  await expect(detail.title()).toContainText('City Prayer Night');
  await expect(detail.statusChip()).toBeVisible();
  await expect(detail.statusChip()).toHaveText('Scheduled');
  await expect(detail.statusChip()).toHaveAttribute('data-status', 'Scheduled');
});

test('attendees grid shows avatars; clicking more opens full list dialog', async ({ page }) => {
  await seedLead(page);
  const detail = new EventDetailPage(page);
  await detail.goto('ev1');

  await expect(detail.attendeesGrid()).toBeVisible();
  await expect(detail.attendeeAvatar('a1')).toBeVisible();

  await expect(detail.attendeesMoreButton()).toBeVisible();
  await detail.attendeesMoreButton().click();

  await expect(detail.attendeesDialog()).toBeVisible();
  await expect(detail.attendeeListItem('a6')).toBeVisible();
});

test('"Add to calendar" button is visible on the detail page', async ({ page }) => {
  await seedLead(page);
  const detail = new EventDetailPage(page);
  await detail.goto('ev1');

  await expect(detail.addToCalendarButton()).toBeVisible();
});

test('share button is visible on the detail page', async ({ page }) => {
  await seedLead(page);
  const detail = new EventDetailPage(page);
  await detail.goto('ev1');

  await expect(detail.shareButton()).toBeVisible();
});
