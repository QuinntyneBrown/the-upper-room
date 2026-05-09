// traces_to: L2-059
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../pages/DashboardPage';

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({
      roles: ['CityLead'],
      permissions: ['Event:Read', 'Contact:Read', 'Partner:Read', 'Idea:Read'],
    });
  });
  await page.route('/api/v1/notifications**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });
}

const DASHBOARD_DATA = {
  firstName: 'Jane',
  stats: { contacts: 42, partners: 7, upcomingEvents: 3, openIdeas: 5 },
  upcomingEvents: [
    { id: 'ev1', title: 'City Prayer Night', startAt: '2026-06-15T19:00:00Z', location: 'City Hall' },
    { id: 'ev2', title: 'Youth Worship', startAt: '2026-06-22T18:00:00Z', location: null },
    { id: 'ev3', title: 'Leaders Debrief', startAt: '2026-06-29T10:00:00Z', location: 'Zoom' },
  ],
  recentActivity: [],
  myIdeas: [],
  tasksOnMyBoards: [
    { boardId: 'board-1', boardTitle: 'City Planning', cards: [{ id: 'card-1', title: 'Follow up with venue' }] },
    { boardId: 'board-2', boardTitle: 'Outreach', cards: [{ id: 'card-2', title: 'Design flyer' }] },
  ],
};

test('Dashboard shows welcome header with first name', async ({ page }) => {
  await seedLead(page);
  await page.route('**/api/v1/dashboard', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(DASHBOARD_DATA) });
  });

  const dash = new DashboardPage(page);
  await dash.goto();

  await expect(dash.welcomeHeader()).toContainText('Welcome, Jane');
});

test('Stat cards show counts from API', async ({ page }) => {
  await seedLead(page);
  await page.route('**/api/v1/dashboard', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(DASHBOARD_DATA) });
  });

  const dash = new DashboardPage(page);
  await dash.goto();

  await expect(dash.statCount('contacts')).toContainText('42');
  await expect(dash.statCount('partners')).toContainText('7');
  await expect(dash.statCount('upcoming-events')).toContainText('3');
  await expect(dash.statCount('open-ideas')).toContainText('5');
});

test('Upcoming events widget shows events and View calendar link', async ({ page }) => {
  await seedLead(page);
  await page.route('**/api/v1/dashboard', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(DASHBOARD_DATA) });
  });

  const dash = new DashboardPage(page);
  await dash.goto();

  await expect(dash.upcomingEventsWidget()).toBeVisible();
  await expect(dash.upcomingEventItem('ev1')).toBeVisible();
  await expect(dash.upcomingEventItem('ev2')).toBeVisible();
  await expect(dash.viewCalendarLink()).toBeVisible();
});

test('Tasks on my boards groups cards by board', async ({ page }) => {
  await seedLead(page);
  await page.route('**/api/v1/dashboard', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(DASHBOARD_DATA) });
  });

  const dash = new DashboardPage(page);
  await dash.goto();

  await expect(dash.myBoardsWidget()).toBeVisible();
  await expect(dash.boardGroup('board-1')).toBeVisible();
  await expect(dash.boardGroup('board-2')).toBeVisible();
  await expect(page.getByText('City Planning')).toBeVisible();
  await expect(page.getByText('Follow up with venue')).toBeVisible();
});
