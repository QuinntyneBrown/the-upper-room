// traces_to: L2-053
import { test, expect } from '../../fixtures/test';
import { seedSession } from '../../fixtures/session';
import { EventsListPage } from '../../pages/EventsListPage';

test('a user with Event:Create can open the new event form from the list', async ({ page }) => {
  await seedSession(page, { roles: ['CityLead'], permissions: ['Event:Read', 'Event:Create'] });
  const list = new EventsListPage(page);
  await list.goto();

  await list.newEventButton().click();

  await expect(page).toHaveURL(/\/events\/new$/);
});

test('a user without Event:Create does not see the new event button', async ({ page }) => {
  await seedSession(page, { roles: ['Member'], permissions: ['Event:Read'] });
  const list = new EventsListPage(page);
  await list.goto();

  await expect(list.statusFilter()).toBeVisible();
  await expect(list.newEventButton()).toHaveCount(0);
});
