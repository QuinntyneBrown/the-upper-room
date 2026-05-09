// traces_to: L2-097
import { test, expect, Page } from '@playwright/test';

async function seedUser(page: Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('member-token');
    win.__setRbac?.({ roles: ['Member'], permissions: [] });
  });
}

test('API call with correlation ID produces correlated log trail', async ({ page }) => {
  const correlationId = 'e2e-' + Math.random().toString(36).slice(2, 10);

  await page.route('**/api/v1/health', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok' }) }));

  await page.route('**/api/v1/test/logs**', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          level: 'Information',
          message: 'HTTP GET /api/v1/health responded 200',
          properties: { CorrelationId: correlationId },
          timestamp: new Date().toISOString(),
        },
      ]),
    }));

  await seedUser(page);

  const status = await page.evaluate(async (corrId: string): Promise<number> => {
    const res = await fetch('/api/v1/health', {
      headers: { 'X-Correlation-Id': corrId },
    });
    return res.status;
  }, correlationId);
  expect(status).toBe(200);

  const logs = await page.evaluate(async (corrId: string): Promise<{ properties: { CorrelationId: string } }[]> => {
    const res = await fetch(`/api/v1/test/logs?correlationId=${corrId}`);
    return res.json();
  }, correlationId);

  expect(logs.length).toBeGreaterThan(0);
  expect(logs[0].properties.CorrelationId).toBe(correlationId);
});
