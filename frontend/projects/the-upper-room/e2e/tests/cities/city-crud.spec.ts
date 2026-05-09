// traces_to: L2-077
import { test, expect } from '@playwright/test';
import { CitiesPage } from '../../pages/CitiesPage';
import { ConfirmDialog } from '../../components/ConfirmDialog';

interface City {
  id: string;
  name: string;
  slug: string;
  country: string;
  archived: boolean;
  members: number;
}

async function seed(page: import('@playwright/test').Page) {
  const cities: City[] = [];
  await page.route('**/api/v1/cities**', (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    if (method === 'GET' && /\/cities$/.test(url.pathname)) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: cities }) });
    }
    if (method === 'POST' && /\/cities$/.test(url.pathname)) {
      const body = route.request().postDataJSON() as { name: string; country: string };
      const slug = body.name.toLowerCase().trim().replace(/\s+/g, '-');
      if (cities.some((c) => c.slug === slug && c.country === body.country)) {
        return route.fulfill({
          status: 409,
          contentType: 'application/problem+json',
          body: JSON.stringify({ code: 'validation.duplicate' }),
        });
      }
      const created: City = { id: slug, name: body.name, slug, country: body.country, archived: false, members: 2 };
      cities.push(created);
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(created) });
    }
    if (method === 'POST' && /\/archive$/.test(url.pathname)) {
      const slug = url.pathname.split('/').slice(-2)[0]!;
      const c = cities.find((x) => x.slug === slug);
      if (c) c.archived = true;
      return route.fulfill({ status: 204, body: '' });
    }
    return route.continue();
  });
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[]; userId?: string }) => void;
    };
    win.__setTestToken?.('admin');
    win.__setRbac?.({ roles: ['SystemAdmin'], permissions: ['City:Switch'], userId: 'admin' });
  });
}

test('create Toronto: row appears with slug toronto', async ({ page }) => {
  await seed(page);
  const cities = new CitiesPage(page);
  await cities.goto();
  await cities.newButton().click();
  await cities.nameInput().fill('Toronto');
  await cities.countryInput().fill('CA');
  await cities.saveButton().click();
  await expect(cities.row('toronto')).toContainText('Toronto');
});

test('duplicate name in country surfaces validation.duplicate message', async ({ page }) => {
  await seed(page);
  const cities = new CitiesPage(page);
  await cities.goto();
  await cities.newButton().click();
  await cities.nameInput().fill('Toronto');
  await cities.countryInput().fill('CA');
  await cities.saveButton().click();
  await cities.newButton().click();
  await cities.nameInput().fill('Toronto');
  await cities.countryInput().fill('CA');
  await cities.saveButton().click();
  await expect(cities.formError()).toContainText('already exists');
});

test('archive city with members shows warning confirm; archives on confirm', async ({ page }) => {
  await seed(page);
  const cities = new CitiesPage(page);
  const dlg = new ConfirmDialog(page);
  await cities.goto();
  await cities.newButton().click();
  await cities.nameInput().fill('Halifax');
  await cities.countryInput().fill('CA');
  await cities.saveButton().click();
  await cities.archive('halifax').click();
  await expect(dlg.body()).toContainText('members will lose');
  await dlg.confirmButton().click();
  await expect(cities.row('halifax')).toContainText('Archived');
});
