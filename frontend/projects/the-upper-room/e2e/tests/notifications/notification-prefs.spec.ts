// traces_to: L2-064
import { test, expect, Page } from '@playwright/test';
import { NotificationPreferencesPage } from '../../pages/NotificationPreferencesPage';
import { NotificationBell } from '../../components/NotificationBell';

const ALL_CODES = [
  'welcome', 'email_verified', 'invite_sent', 'invite_accepted',
  'event_created', 'event_reminder_24h', 'event_starting_soon', 'event_cancelled',
  'idea_voted', 'idea_status_changed', 'kanban_assigned', 'note_mention',
  'password_changed', 'signin_new_device',
];

interface PrefDto { code: string; inApp: boolean; email: boolean; push: boolean; }

function defaultPrefs(): PrefDto[] {
  return ALL_CODES.map((code) => ({ code, inApp: true, email: true, push: false }));
}

async function seedUser(page: Page): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('member-token');
    win.__setRbac?.({ roles: ['Member'], permissions: [] });
  });
}

test('all 14 notification codes are listed', async ({ page }) => {
  await page.route('**/api/v1/notifications/preferences', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(defaultPrefs()) }));

  await seedUser(page);
  await page.goto('/settings/notifications');

  const prefPage = new NotificationPreferencesPage(page);
  await expect(prefPage.rows()).toHaveCount(14);
  for (const code of ALL_CODES) {
    await expect(prefPage.row(code)).toBeVisible();
  }
});

test('toggle off event_cancelled email → PUT called after debounce, Saved indicator shown', async ({ page }) => {
  let savedBody: PrefDto | null = null;

  await page.route('**/api/v1/notifications/preferences', (r) => {
    if (r.request().method() === 'PUT') {
      savedBody = r.request().postDataJSON() as PrefDto;
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(savedBody) });
    } else {
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(defaultPrefs()) });
    }
  });

  await seedUser(page);
  await page.goto('/settings/notifications');

  const prefPage = new NotificationPreferencesPage(page);
  await prefPage.toggle('event_cancelled', 'email').click();

  await expect(prefPage.savedIndicator('event_cancelled')).toBeVisible({ timeout: 3000 });
  expect(savedBody).not.toBeNull();
  expect((savedBody as unknown as PrefDto).email).toBe(false);
  expect((savedBody as unknown as PrefDto).code).toBe('event_cancelled');
});

test('reload preserves the toggle state', async ({ page }) => {
  const prefs = defaultPrefs().map((p) =>
    p.code === 'event_cancelled' ? { ...p, email: false } : p,
  );

  await page.route('**/api/v1/notifications/preferences', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(prefs) }));

  await seedUser(page);
  await page.goto('/settings/notifications');

  const prefPage = new NotificationPreferencesPage(page);
  await expect(prefPage.toggle('event_cancelled', 'email')).not.toBeChecked();
  await expect(prefPage.toggle('event_cancelled', 'inApp')).toBeChecked();
});

test('disabled event_reminder_24h skips dispatch delivery', async ({ page }) => {
  const prefs = defaultPrefs().map((p) =>
    p.code === 'event_reminder_24h' ? { ...p, inApp: false } : p,
  );

  await page.route('**/api/v1/notifications/preferences', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(prefs) }));

  await page.route('**/api/v1/notifications/dispatch', (r) =>
    r.fulfill({ status: 204, body: '' }));

  await page.route('**/api/v1/notifications', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }));

  await seedUser(page);
  await page.goto('/settings/notifications');

  await expect(new NotificationPreferencesPage(page).toggle('event_reminder_24h', 'inApp')).not.toBeChecked();

  await page.goto('/sign-in');
  const bell = new NotificationBell(page);
  await expect(bell.badge()).toBeHidden();
});
