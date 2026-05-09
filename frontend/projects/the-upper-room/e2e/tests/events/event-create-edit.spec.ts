// traces_to: L2-056
import { test, expect } from '@playwright/test';
import { EventFormPage } from '../../pages/EventFormPage';

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Event:Read', 'Event:Create', 'Event:Edit'] });
  });
  await page.route('/api/v1/notifications**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });
}

test('end before start shows field error and disables submit', async ({ page }) => {
  await seedLead(page);
  const form = new EventFormPage(page);
  await form.gotoNew();

  await form.titleInput().fill('My Event');
  await form.startInput().fill('2026-06-15T14:00');
  await form.endInput().fill('2026-06-15T12:00');

  await expect(form.endError()).toHaveText('End time must be after start time.');
  await expect(form.submitButton()).toBeDisabled();
});

test('pick location from autocomplete updates preview card', async ({ page }) => {
  await seedLead(page);
  await page.route('**/api/v1/locations**', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [{ id: 'l1', name: 'City Hall', street: '1 City Hall Sq', city: '', state: '', country: '', postalCode: '', capacity: null, lat: null, lng: null, archived: false, photos: [], eventCount: 0 }], total: 1 }),
    });
  });

  const form = new EventFormPage(page);
  await form.gotoNew();

  await form.locationSearch().fill('City');
  await form.locationResult('l1').click();

  await expect(form.previewLocation()).toContainText('City Hall');
});

test('switch timezone updates timezone label; stored UTC value unchanged', async ({ page }) => {
  await seedLead(page);
  const form = new EventFormPage(page);
  await form.gotoNew();

  await form.startInput().fill('2026-06-15T14:00');

  await expect(form.previewTimezoneLabel()).toContainText('UTC');
  await expect(form.startInput()).toHaveValue('2026-06-15T14:00');

  await form.timezoneSelect().selectOption('America/New_York');

  await expect(form.previewTimezoneLabel()).toContainText('America/New_York');
  await expect(form.startInput()).toHaveValue('2026-06-15T14:00');
});

test('save and reload - title round-trips correctly', async ({ page }) => {
  const saved = {
    id: 'new1', title: 'My Event', description: 'desc', coverImageUrl: null,
    status: 'Draft', startAt: '2026-06-15T14:00:00Z', endAt: '2026-06-15T16:00:00Z',
    location: null, isVirtual: false, rsvpCount: 0, capacity: null, tags: [], attendees: [],
  };

  await seedLead(page);
  await page.route('**/api/v1/events', (route) => {
    if (route.request().method() === 'POST') {
      void route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(saved) });
    } else {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
    }
  });
  await page.route('**/api/v1/events/new1', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(saved) });
  });

  const form = new EventFormPage(page);
  await form.gotoNew();

  await form.titleInput().fill('My Event');
  await form.startInput().fill('2026-06-15T14:00');
  await form.endInput().fill('2026-06-15T16:00');
  await form.submitButton().click();

  await expect(page).toHaveURL(/\/events\/new1\/edit/);
  await expect(form.titleInput()).toHaveValue('My Event');
});
