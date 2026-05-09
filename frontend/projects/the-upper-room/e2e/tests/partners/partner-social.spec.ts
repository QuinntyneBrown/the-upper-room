// traces_to: L2-034, L2-037
import { test, expect } from '@playwright/test';

const partner = {
  id: 'p1',
  name: 'Grace Church',
  website: 'https://grace.org',
  cityId: 'Toronto',
  contactCount: 0,
  tags: [],
  archived: false,
  logo: null,
  descriptionMarkdown: null,
  addresses: [],
  socialLinks: [] as { platform: string; url: string; label?: string }[],
};

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Partner:Create'] });
  });

  await page.route('/api/v1/notifications**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });
}

test('add LinkedIn URL → detail shows LinkedIn chip', async ({ page }) => {
  let savedLinks: { platform: string; url: string; label?: string }[] = [];

  await page.route('**/api/v1/partners/p1', (route) => {
    if (route.request().method() === 'PUT') {
      const body = JSON.parse(route.request().postData() ?? '{}') as { socialLinks?: typeof savedLinks };
      savedLinks = body.socialLinks ?? [];
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...partner, socialLinks: savedLinks }) });
    } else {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...partner, socialLinks: savedLinks }) });
    }
  });

  await seedLead(page);
  await page.goto('/partners/p1/edit');

  await page.getByTestId('social-add-button').click();
  await page.getByTestId('social-platform-0').selectOption('LinkedIn');
  await page.getByTestId('social-url-0').fill('https://linkedin.com/company/x');
  await page.getByTestId('partner-submit').click();

  await expect(page).toHaveURL(/\/partners\/p1(?!\/edit)/);
  await expect(page.getByTestId('social-chip-LinkedIn')).toBeVisible();
  await expect(page.getByTestId('social-chip-LinkedIn')).toContainText('LinkedIn');
});

test('invalid URL on save shows field error', async ({ page }) => {
  await page.route('**/api/v1/partners/p1', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(partner) });
  });

  await seedLead(page);
  await page.goto('/partners/p1/edit');

  await page.getByTestId('social-add-button').click();
  await page.getByTestId('social-platform-0').selectOption('LinkedIn');
  await page.getByTestId('social-url-0').fill('not-a-url');
  await page.getByTestId('partner-submit').click();

  await expect(page.getByTestId('social-url-error-0')).toBeVisible();
  await expect(page.getByTestId('social-url-error-0')).toContainText('http');
});

test('"Other" platform requires a label', async ({ page }) => {
  await page.route('**/api/v1/partners/p1', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(partner) });
  });

  await seedLead(page);
  await page.goto('/partners/p1/edit');

  await page.getByTestId('social-add-button').click();
  await page.getByTestId('social-platform-0').selectOption('Other');
  await page.getByTestId('social-url-0').fill('https://example.com');
  await page.getByTestId('partner-submit').click();

  await expect(page.getByTestId('social-label-error-0')).toBeVisible();
});
