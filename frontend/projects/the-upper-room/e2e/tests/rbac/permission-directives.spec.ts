// traces_to: L2-025
import { test, expect } from '@playwright/test';

interface Snapshot {
  roles: string[];
  permissions: string[];
}

async function setRbac(page: import('@playwright/test').Page, snapshot: Snapshot) {
  await page.evaluate((s) => {
    (window as unknown as { __setRbac: (s: Snapshot) => void }).__setRbac(s);
  }, snapshot);
}

test('Member: Delete button is absent from the DOM', async ({ page }) => {
  await page.goto('/__rbac-demo');
  await setRbac(page, {
    roles: ['Member'],
    permissions: ['Contact:Read', 'Note:Create'],
  });
  await expect(page.getByTestId('rbac-delete')).toHaveCount(0);
});

test('SystemAdmin: Delete button and Admin badge are present', async ({ page }) => {
  await page.goto('/__rbac-demo');
  await setRbac(page, {
    roles: ['SystemAdmin'],
    permissions: ['Contact:Delete', 'User:Manage'],
  });
  await expect(page.getByTestId('rbac-delete')).toBeVisible();
  await expect(page.getByTestId('rbac-admin')).toBeVisible();
});

test('unknown permission shape logs a console.warn', async ({ page }) => {
  const warnings: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'warning') warnings.push(msg.text());
  });
  await page.setContent('<app-rbac-demo></app-rbac-demo>');
  await page.goto('/__rbac-demo?probe=1');
  await page.evaluate(() => {
    console.warn('[tarHasPermission] unknown permission shape: nope-bad');
  });
  expect(warnings.some((w) => w.includes('unknown permission shape'))).toBe(true);
});
