// traces_to: L2-009, L2-010, L2-011, L2-012, L2-013, L2-014, L2-026
import { test, expect } from '../../fixtures/test';
import { AppShell } from '../../components/AppShell';
import { seedSession } from '../../fixtures/session';

test.describe('app shell', () => {
  test.beforeEach(async ({ page }) => {
    await seedSession(page, { roles: ['Member'], permissions: ['Contact:Read'] });
  });

  test('XS: top bar 56px; drawer hidden until toggle', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/dashboard');
    const shell = new AppShell(page);
    await expect(shell.topBar()).toHaveCSS('height', '56px');
    await expect(shell.drawer()).not.toHaveClass(/app-shell__drawer--open/);
    await expect(shell.drawer()).toHaveCSS('transform', 'matrix(1, 0, 0, 1, -280, 0)');
    await shell.drawerToggle().click();
    await expect(shell.drawer()).toHaveClass(/app-shell__drawer--open/);
    await expect(shell.drawer()).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
    await expect(shell.scrim()).toBeVisible();
  });

  test('LG: drawer permanently visible 280px; toggle hidden', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard');
    const shell = new AppShell(page);
    await expect(shell.drawer()).toBeVisible();
    await expect(shell.drawer()).toHaveCSS('width', '280px');
    await expect(shell.drawerToggle()).toBeHidden();
  });

  test('MD+: breadcrumbs visible on nested route', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto('/contacts/123/edit');
    const shell = new AppShell(page);
    await expect(shell.breadcrumbs()).toBeVisible();
    await expect(shell.breadcrumbs()).toContainText('Contacts');
    await expect(shell.breadcrumbs()).toContainText('Edit');
  });

  test('XS: breadcrumbs hidden', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/contacts/123/edit');
    const shell = new AppShell(page);
    await expect(shell.breadcrumbs()).toBeHidden();
  });

  test('first Tab focuses skip link, activating it focuses <main>', async ({ page }) => {
    await page.goto('/dashboard');
    const shell = new AppShell(page);
    await page.keyboard.press('Tab');
    await expect(shell.skipLink()).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });

  test('top bar gains elevation after scroll > 200px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard');
    const shell = new AppShell(page);
    await expect(shell.topBar()).toHaveCSS('box-shadow', 'none');
    await page.evaluate(() => {
      const spacer = document.createElement('div');
      spacer.style.height = '3000px';
      document.querySelector('main')?.appendChild(spacer);
      window.scrollTo(0, 250);
    });
    await expect(shell.topBar()).not.toHaveCSS('box-shadow', 'none');
  });
});
