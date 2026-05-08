// traces_to: L2-031
import { test, expect } from '@playwright/test';
import { ContactDetailPage } from '../../pages/ContactDetailPage';

const seedContact = {
  id: 'c1',
  name: 'Alice Smith',
  cityId: 'Toronto',
  title: 'Pastor',
  org: 'Grace Church',
  phones: [
    { value: '+14165550100', label: 'Mobile', primary: true },
    { value: '+14165550101', label: 'Office', primary: false },
    { value: '+14165550102', label: 'Home', primary: false },
  ],
  emails: [
    { value: 'alice@grace.org', label: 'Work', primary: true },
    { value: 'alice@personal.com', label: 'Personal', primary: false },
  ],
  tags: [{ id: 't1', name: 'VIP', color: 'purple', usageCount: 0 }],
  archived: false,
};

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Contact:Create'] });
  });
}

test('three phones render with labels', async ({ page }) => {
  await page.route('**/api/v1/contacts/c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(seedContact) }),
  );
  await seedLead(page);
  const detail = new ContactDetailPage(page);
  await detail.goto('c1');
  await expect(detail.phones()).toContainText('+14165550100');
  await expect(detail.phones()).toContainText('Mobile');
  await expect(detail.phones()).toContainText('+14165550101');
  await expect(detail.phones()).toContainText('Office');
});

test('emails render with mailto links', async ({ page }) => {
  await page.route('**/api/v1/contacts/c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(seedContact) }),
  );
  await seedLead(page);
  const detail = new ContactDetailPage(page);
  await detail.goto('c1');
  const emails = detail.emails();
  await expect(emails).toContainText('alice@grace.org');
  await expect(page.locator('a[href="mailto:alice@grace.org"]')).toBeVisible();
});

test('tabs Overview, Notes, Activity are rendered', async ({ page }) => {
  await page.route('**/api/v1/contacts/c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(seedContact) }),
  );
  await seedLead(page);
  const detail = new ContactDetailPage(page);
  await detail.goto('c1');
  await expect(detail.tab('overview')).toBeVisible();
  await expect(detail.tab('notes')).toBeVisible();
  await expect(detail.tab('activity')).toBeVisible();
});

test('at MD+ two-column layout', async ({ page }) => {
  await page.route('**/api/v1/contacts/c1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(seedContact) }),
  );
  await page.setViewportSize({ width: 1024, height: 768 });
  await seedLead(page);
  const detail = new ContactDetailPage(page);
  await detail.goto('c1');
  await expect(detail.overviewPanel()).toBeVisible();
  const panelStyle = await detail.overviewPanel().evaluate((el) => getComputedStyle(el).gridTemplateColumns);
  expect(panelStyle.split(' ').length).toBeGreaterThanOrEqual(2);
});
