// traces_to: L2-055
import { test, expect } from '@playwright/test';
import { EventDetailPage } from '../../pages/EventDetailPage';

const EVENT = {
  id: 'ev-ics',
  title: 'Prayer Night',
  coverImageUrl: null,
  status: 'Scheduled',
  startAt: '2026-07-01T19:00:00Z',
  endAt: '2026-07-01T21:00:00Z',
  location: 'City Hall',
  isVirtual: false,
  rsvpCount: 0,
  capacity: null,
  tags: [],
  description: 'A night of prayer.',
  attendees: [],
  requiresApproval: false,
};

const ICS_BODY = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'BEGIN:VEVENT',
  'UID:ev-ics@the-upper-room',
  'SUMMARY:Prayer Night',
  'DTSTART:20260701T190000Z',
  'DTEND:20260701T210000Z',
  'LOCATION:City Hall',
  'DESCRIPTION:A night of prayer.',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n');

async function setup(page: import('@playwright/test').Page): Promise<void> {
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

test('Add to calendar downloads ICS with required VCALENDAR fields', async ({ page }) => {
  await setup(page);
  await page.route('**/api/v1/events/ev-ics', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(EVENT) });
  });
  await page.route('**/api/v1/events/ev-ics/rsvp', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rsvpStatus: null }) });
  });
  await page.route('**/api/v1/events/ev-ics/rsvp/requests', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });
  await page.route('**/api/v1/events/ev-ics/ics', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'text/calendar',
      headers: { 'Content-Disposition': 'attachment; filename="prayer-night.ics"' },
      body: ICS_BODY,
    });
  });

  const detail = new EventDetailPage(page);
  await detail.goto('ev-ics');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('event-add-to-calendar').click(),
  ]);

  expect(download.suggestedFilename()).toMatch(/\.ics$/);
  const content = await (await download.createReadStream()).read().then((buf) => (buf as Buffer).toString());
  expect(content).toContain('BEGIN:VCALENDAR');
  expect(content).toContain('END:VCALENDAR');
  expect(content).toContain('SUMMARY:Prayer Night');
  expect(content).toContain('DTSTART:20260701T190000Z');
  expect(content).toContain('DTEND:20260701T210000Z');
  expect(content).toContain('LOCATION:City Hall');
  expect(content).toContain('UID:ev-ics@the-upper-room');
});

test('ICS UID is stable across downloads', async ({ page }) => {
  await setup(page);
  await page.route('**/api/v1/events/ev-ics', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(EVENT) });
  });
  await page.route('**/api/v1/events/ev-ics/rsvp', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rsvpStatus: null }) });
  });
  await page.route('**/api/v1/events/ev-ics/rsvp/requests', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });
  await page.route('**/api/v1/events/ev-ics/ics', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'text/calendar',
      headers: { 'Content-Disposition': 'attachment; filename="prayer-night.ics"' },
      body: ICS_BODY,
    });
  });

  const detail = new EventDetailPage(page);
  await detail.goto('ev-ics');

  const [d1] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('event-add-to-calendar').click(),
  ]);
  const content1 = await (await d1.createReadStream()).read().then((buf) => (buf as Buffer).toString());

  const [d2] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('event-add-to-calendar').click(),
  ]);
  const content2 = await (await d2.createReadStream()).read().then((buf) => (buf as Buffer).toString());

  const uid1 = content1.match(/UID:(.+)/)?.[1]?.trim();
  const uid2 = content2.match(/UID:(.+)/)?.[1]?.trim();
  expect(uid1).toBeTruthy();
  expect(uid1).toBe(uid2);
});

test('DTSTART and DTEND use UTC Z suffix', async ({ page }) => {
  await setup(page);
  await page.route('**/api/v1/events/ev-ics', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(EVENT) });
  });
  await page.route('**/api/v1/events/ev-ics/rsvp', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rsvpStatus: null }) });
  });
  await page.route('**/api/v1/events/ev-ics/rsvp/requests', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });
  await page.route('**/api/v1/events/ev-ics/ics', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'text/calendar',
      headers: { 'Content-Disposition': 'attachment; filename="prayer-night.ics"' },
      body: ICS_BODY,
    });
  });

  const detail = new EventDetailPage(page);
  await detail.goto('ev-ics');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('event-add-to-calendar').click(),
  ]);

  const content = await (await download.createReadStream()).read().then((buf) => (buf as Buffer).toString());
  expect(content).toMatch(/DTSTART:\d{8}T\d{6}Z/);
  expect(content).toMatch(/DTEND:\d{8}T\d{6}Z/);
});
