// traces_to: L2-107
import { test, expect } from '@playwright/test';
import { MyProfilePage } from '../../pages/MyProfilePage';

const initial = {
  firstName: 'Alice',
  lastName: 'Brown',
  displayName: 'Alice',
  pronouns: 'she/her',
  title: '',
  city: 'Toronto',
  timezone: 'America/Toronto',
  locale: 'en-CA',
};

async function seedProfile(page: import('@playwright/test').Page, role: 'SystemAdmin' | 'Member') {
  let saved = { ...initial };
  await page.route('**/api/v1/users/me/profile', (route) => {
    if (route.request().method() === 'GET')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(saved) });
    if (route.request().method() === 'PATCH') {
      saved = { ...saved, ...(route.request().postDataJSON() as object) };
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(saved) });
    }
    return route.continue();
  });
  await page.goto('/dashboard-stub');
  await page.evaluate((r) => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[]; userId?: string }) => void;
    };
    win.__setTestToken?.('me');
    win.__setRbac?.({ roles: [r], permissions: [], userId: 'me' });
  }, role);
}

test('Save is disabled until a field changes; saving fires snackbar and persists', async ({ page }) => {
  await seedProfile(page, 'Member');
  const profile = new MyProfilePage(page);
  await profile.goto();
  await expect(profile.saveButton()).toBeDisabled();
  await profile.displayName().fill('Ali');
  await expect(profile.saveButton()).toBeEnabled();
  await profile.saveButton().click();
  await expect(page.getByTestId('snackbar')).toContainText('Profile updated');
  await page.reload();
  await expect(profile.displayName()).toHaveValue('Ali');
});

test('Cancel reverts edits without persisting', async ({ page }) => {
  await seedProfile(page, 'Member');
  const profile = new MyProfilePage(page);
  await profile.goto();
  await profile.displayName().fill('changed');
  await profile.cancelButton().click();
  await expect(profile.displayName()).toHaveValue(initial.displayName);
});

test('Member cannot edit city', async ({ page }) => {
  await seedProfile(page, 'Member');
  const profile = new MyProfilePage(page);
  await profile.goto();
  await expect(profile.city()).toHaveAttribute('readonly', '');
});
