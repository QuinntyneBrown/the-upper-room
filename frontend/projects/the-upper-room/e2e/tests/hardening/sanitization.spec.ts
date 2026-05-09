// traces_to: L2-093
import { test, expect } from '@playwright/test';

test('XSS payload in note does not trigger alert', async ({ page }) => {
  const xssPayload = '<img src=x onerror=alert(1)>';
  let alertFired = false;

  page.on('dialog', async (dialog) => {
    alertFired = true;
    await dialog.dismiss();
  });

  await page.route('**/api/v1/contacts/xss-c1/notes', (r) => {
    if (r.request().method() === 'GET') {
      r.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          id: 'n1',
          body: xssPayload,
          authorName: 'Test',
          createdAt: new Date().toISOString(),
        }]),
      });
    } else {
      r.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({}) });
    }
  });

  await page.route('**/api/v1/contacts/xss-c1', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'xss-c1', name: 'XSS Test', phones: [], emails: [], tags: [], archived: false }),
    }),
  );

  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: [] });
  });

  await page.goto('/contacts/xss-c1');
  await page.getByTestId('contact-tab-notes').click();

  await page.waitForTimeout(500);
  expect(alertFired).toBe(false);
});
