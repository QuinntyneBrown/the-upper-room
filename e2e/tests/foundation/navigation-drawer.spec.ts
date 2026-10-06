// traces_to: L2-010
import { test, expect } from '../../fixtures/test';
import { AppShell } from '../../components/AppShell';
import { seedSession } from '../../fixtures/session';

test.describe('navigation drawer', () => {
  test('Member sees the workspace, people and activity items but no Admin section', async ({
    page,
  }) => {
    await seedSession(page, { roles: ['Member'], permissions: ['Contact:Read'] });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard');
    const shell = new AppShell(page);

    for (const section of ['Workspace', 'People', 'Activities']) {
      await expect(shell.navSection(section)).toBeVisible();
    }
    for (const item of [
      'Dashboard',
      'Contacts',
      'Partners',
      'Kanban Boards',
      'Hackathon Ideas',
      'Events',
      'Locations',
    ]) {
      await expect(shell.navItem(item)).toBeVisible();
    }
    await expect(shell.navSection('Admin')).toHaveCount(0);
    await expect(shell.navItem('Users')).toHaveCount(0);
  });

  test('choosing Contacts navigates to the contact list', async ({ page }) => {
    await seedSession(page, { roles: ['Member'], permissions: ['Contact:Read'] });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard');
    const shell = new AppShell(page);

    await shell.navItem('Contacts').click();

    await expect(page).toHaveURL(/\/contacts$/);
  });

  test('only the item for the active route shows the active state', async ({ page }) => {
    await seedSession(page, { roles: ['Member'], permissions: ['Contact:Read'] });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/contacts/123');
    const shell = new AppShell(page);

    await expect(shell.activeNavItems()).toHaveCount(1);
    await expect(shell.activeNavItems()).toHaveText(/Contacts/);
  });

  test('SystemAdmin sees the Admin section', async ({ page }) => {
    await seedSession(page, { roles: ['SystemAdmin'], permissions: [] });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard');
    const shell = new AppShell(page);

    await expect(shell.navSection('Admin')).toBeVisible();
    for (const item of ['Users', 'Cities', 'Tags', 'Audit Log']) {
      await expect(shell.navItem(item)).toBeVisible();
    }
  });
});
