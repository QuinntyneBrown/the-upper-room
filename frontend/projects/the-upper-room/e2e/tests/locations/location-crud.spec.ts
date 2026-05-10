// traces_to: L2-057, L2-058
import { test, expect, Page } from '@playwright/test';
import { LocationsListPage } from '../../pages/LocationsListPage';
import { LocationFormPage } from '../../pages/LocationFormPage';

interface LocationDto {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  capacity: number | null;
  lat: number | null;
  lng: number | null;
  archived: boolean;
}

function makeLocation(overrides: Partial<LocationDto> = {}): LocationDto {
  return {
    id: 'loc-1',
    name: 'Main Chapel',
    street: '123 Church St',
    city: 'Toronto',
    state: 'ON',
    country: 'Canada',
    postalCode: 'M5V 1A1',
    capacity: 200,
    lat: null,
    lng: null,
    archived: false,
    ...overrides,
  };
}

async function seedUser(page: Page): Promise<void> {
  await page.route('**/api/v1/notifications**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }));
  await page.route('**/api/v1/users/me', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'lead', email: 'lead@example.com', roles: ['CityLead'], permissions: ['Location:Create', 'Location:Delete', 'Location:Archive'] }) }));
  await page.route('**/api/v1/cities**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [{ id: 'Toronto', name: 'Toronto' }], total: 1 }) }));
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Location:Create', 'Location:Delete', 'Location:Archive'] });
  });
}

test('empty /locations shows location_off empty state with New location CTA', async ({ page }) => {
  await page.route('**/api/v1/locations**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }));

  await seedUser(page);
  const list = new LocationsListPage(page);
  await list.goto();

  await expect(list.emptyState()).toBeVisible();
  await expect(list.emptyState()).toContainText('location_off');
  await expect(list.newButton()).toBeVisible();
});

test('create location with full address → appears in grid', async ({ page }) => {
  const created = makeLocation();
  let posted = false;

  await page.route('**/api/v1/locations', async (route) => {
    if (route.request().method() === 'POST') {
      posted = true;
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(created) });
    } else {
      const items = posted ? [created] : [];
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items, total: items.length }) });
    }
  });

  await seedUser(page);
  const form = new LocationFormPage(page);
  await form.goto();

  await form.nameInput().fill('Main Chapel');
  await form.streetInput().fill('123 Church St');
  await form.cityInput().fill('Toronto');
  await form.stateInput().fill('ON');
  await form.countryInput().fill('Canada');
  await form.postalCodeInput().fill('M5V 1A1');
  await form.capacityInput().fill('200');
  await form.submitButton().click();

  await expect(page).toHaveURL(/\/locations/);
  const list = new LocationsListPage(page);
  await expect(list.locationCard(0)).toBeVisible();
  await expect(list.locationCard(0)).toContainText('Main Chapel');
});

test('delete location referenced by future event → 409; "Archive instead" action archives it', async ({ page }) => {
  const loc = makeLocation();

  await page.route('**/api/v1/locations', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [loc], total: 1 }) }));

  await page.route(`**/api/v1/locations/${loc.id}`, async (route) => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ error: 'Location is used by upcoming events.' }) });
    } else if (route.request().method() === 'PATCH') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...loc, archived: true }) });
    } else {
      await route.continue();
    }
  });

  await seedUser(page);
  const list = new LocationsListPage(page);
  await list.goto();

  await list.deleteButton(0).click();

  await expect(page.getByTestId('snackbar')).toContainText('Archive instead');
  await page.getByTestId('snackbar-action').click();

  await expect(list.locationCard(0)).toContainText('Archived');
});

test('capacity must be positive integer; -1 shows validation error', async ({ page }) => {
  await seedUser(page);
  const form = new LocationFormPage(page);
  await form.goto();

  await form.nameInput().fill('Test Location');
  await form.capacityInput().fill('-1');
  await form.submitButton().click();

  await expect(form.capacityError()).toBeVisible();
  await expect(form.capacityError()).toContainText('positive');
});
