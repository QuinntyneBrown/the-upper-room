// traces_to: L2-106, L2-066
import { test, expect } from '@playwright/test';
import { MyProfilePage } from '../../pages/MyProfilePage';
import { AvatarUploader } from '../../components/AvatarUploader';

const baseProfile = {
  firstName: 'Alice',
  lastName: 'Brown',
  displayName: 'Alice Brown',
  pronouns: '',
  title: '',
  city: 'Toronto',
  timezone: 'America/Toronto',
  locale: 'en-CA',
  avatarUrl: null as string | null,
};

async function seed(page: import('@playwright/test').Page) {
  let profile = { ...baseProfile };
  await page.route('**/api/v1/users/me/profile', (route) => {
    if (route.request().method() === 'GET')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(profile) });
    if (route.request().method() === 'PATCH') {
      profile = { ...profile, ...(route.request().postDataJSON() as object) };
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(profile) });
    }
    return route.continue();
  });
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[]; userId?: string }) => void;
    };
    win.__setTestToken?.('me');
    win.__setRbac?.({ roles: ['Member'], permissions: [], userId: 'me' });
  });
}

test('user without avatarUrl renders initials with a stable color', async ({ page }) => {
  await seed(page);
  const profile = new MyProfilePage(page);
  const av = new AvatarUploader(page);
  await profile.goto();
  await expect(av.initials()).toHaveText('AB');
  const colorA = await av.initials().evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.reload();
  const colorB = await av.initials().evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(colorA).toBe(colorB);
});

test('upload too-large file surfaces L2-066 upload.too_large message', async ({ page }) => {
  await seed(page);
  await page.route('**/api/v1/uploads', (r) =>
    r.fulfill({
      status: 413,
      contentType: 'application/problem+json',
      body: JSON.stringify({ code: 'upload.too_large' }),
    }),
  );
  const profile = new MyProfilePage(page);
  const av = new AvatarUploader(page);
  await profile.goto();
  await av.fileInput().setInputFiles({
    name: 'big.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.alloc(6 * 1024 * 1024, 0xff),
  });
  await expect(page.getByTestId('snackbar')).toContainText('File is too large');
});

test('upload unsupported type surfaces upload.unsupported_type', async ({ page }) => {
  await seed(page);
  await page.route('**/api/v1/uploads', (r) =>
    r.fulfill({
      status: 415,
      contentType: 'application/problem+json',
      body: JSON.stringify({ code: 'upload.unsupported_type' }),
    }),
  );
  const profile = new MyProfilePage(page);
  const av = new AvatarUploader(page);
  await profile.goto();
  await av.fileInput().setInputFiles({
    name: 'doc.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.7'),
  });
  await expect(page.getByTestId('snackbar')).toContainText('Unsupported file type');
});
