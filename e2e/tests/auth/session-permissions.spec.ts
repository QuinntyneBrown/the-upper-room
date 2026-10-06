// traces_to: L2-015, L2-023, L2-025
import { test, expect } from '../../fixtures/test';
import { SignInPage } from '../../pages/SignInPage';
import { AppShell } from '../../components/AppShell';
import { ContactsListPage } from '../../pages/ContactsListPage';

test('after signing in, the user permissions drive the UI without a reload', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const signIn = new SignInPage(page);
  await signIn.goto();
  await signIn.submit('admin@test.local', 'Password!23456');
  await expect(page).toHaveURL(/\/dashboard$/);
  const shell = new AppShell(page);

  await expect(shell.navSection('Admin')).toBeVisible();

  await shell.navItem('Contacts').click();
  await expect(new ContactsListPage(page).emptyStateActionButton()).toBeVisible();
});
