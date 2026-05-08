// traces_to: L2-041, L2-093
import { test, expect } from '@playwright/test';

test('POST /api/v1/notes sanitises script tags and preserves raw markdown', async ({ page }) => {
  const resp = await page.request.post('http://localhost:5000/api/v1/notes', {
    headers: { 'X-Test-User-Id': 'lead', 'Content-Type': 'application/json' },
    data: {
      subjectType: 'Contact',
      subjectId: 'c1',
      bodyMarkdown: '<script>alert(1)</script>foo',
    },
  });

  expect(resp.status()).toBe(201);
  const body = await resp.json();
  expect(body.bodyMarkdown).toBe('<script>alert(1)</script>foo');
  expect(body.bodyHtmlSanitized).not.toContain('<script>');
  expect(body.bodyHtmlSanitized).toContain('foo');
});
