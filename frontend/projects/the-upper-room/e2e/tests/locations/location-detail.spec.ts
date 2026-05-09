// traces_to: L2-058, L2-113
import { test, expect, Page } from '@playwright/test';
import { LocationDetailPage } from '../../pages/LocationDetailPage';

interface LocationDetailDto {
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
  photos: string[];
  eventCount: number;
}

function makeLocation(overrides: Partial<LocationDetailDto> = {}): LocationDetailDto {
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
    photos: [],
    eventCount: 0,
    ...overrides,
  };
}

async function seedUser(page: Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Location:Create', 'Location:Edit'] });
  });
}

test('location with coords renders static map; without coords shows map placeholder', async ({ page }) => {
  const withCoords = makeLocation({ lat: 43.65, lng: -79.38 });
  const withoutCoords = makeLocation({ lat: null, lng: null });

  await page.route('**/api/v1/locations/loc-1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(withCoords) }));

  await seedUser(page);
  const detail = new LocationDetailPage(page);
  await detail.goto('loc-1');

  await expect(detail.mapImage()).toBeVisible();
  await expect(detail.mapPlaceholder()).toBeHidden();

  await page.route('**/api/v1/locations/loc-2', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...withoutCoords, id: 'loc-2' }) }));

  await detail.goto('loc-2');
  await expect(detail.mapImage()).toBeHidden();
  await expect(detail.mapPlaceholder()).toContainText('map');
});

test('upload 3 photos → carousel cycles through them', async ({ page }) => {
  const loc = makeLocation();
  const photos = [
    'https://uploads.example.com/photo-1.jpg',
    'https://uploads.example.com/photo-2.jpg',
    'https://uploads.example.com/photo-3.jpg',
  ];

  let uploadCount = 0;

  await page.route('**/api/v1/locations/loc-1', async (route) => {
    if (route.request().method() === 'POST' && route.request().url().includes('/photos')) {
      uploadCount++;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ ...loc, photos: photos.slice(0, uploadCount) }),
      });
    } else {
      const currentPhotos = uploadCount > 0 ? photos.slice(0, uploadCount) : [];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...loc, photos: currentPhotos }),
      });
    }
  });

  await seedUser(page);
  const detail = new LocationDetailPage(page);
  await detail.goto('loc-1');

  const smallBuf = Buffer.alloc(1024, 'x');
  for (let i = 0; i < 3; i++) {
    await detail.photoInput().setInputFiles({ name: `photo${i}.jpg`, mimeType: 'image/jpeg', buffer: smallBuf });
  }

  await expect(detail.carouselImage()).toHaveAttribute('src', photos[2]);
  await detail.carouselPrev().click();
  await expect(detail.carouselImage()).toHaveAttribute('src', photos[1]);
  await detail.carouselNext().click();
  await expect(detail.carouselImage()).toHaveAttribute('src', photos[2]);
});

test('photo >10MB is rejected; non-image is rejected', async ({ page }) => {
  await page.route('**/api/v1/locations/loc-1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeLocation()) }));

  await seedUser(page);
  const detail = new LocationDetailPage(page);
  await detail.goto('loc-1');

  const oversized = Buffer.alloc(11 * 1024 * 1024, 'x');
  await detail.photoInput().setInputFiles({ name: 'big.jpg', mimeType: 'image/jpeg', buffer: oversized });
  await expect(page.getByTestId('snackbar')).toContainText('too large');

  await page.getByTestId('snackbar-dismiss').click();

  await detail.photoInput().setInputFiles({ name: 'doc.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(1024) });
  await expect(page.getByTestId('snackbar')).toContainText('image');
});

test('click "Used in N events" navigates to events list filtered by location', async ({ page }) => {
  const loc = makeLocation({ eventCount: 3 });

  await page.route('**/api/v1/locations/loc-1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(loc) }));

  await seedUser(page);
  const detail = new LocationDetailPage(page);
  await detail.goto('loc-1');

  await expect(detail.eventsLink()).toContainText('3 events');
  await detail.eventsLink().click();
  await expect(page).toHaveURL(/\/events.*locationId=loc-1/);
});
