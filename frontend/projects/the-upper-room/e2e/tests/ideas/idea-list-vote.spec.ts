// traces_to: L2-048, L2-049
import { test, expect, Page } from '@playwright/test';
import { IdeasListPage } from '../../pages/IdeasListPage';

interface IdeaDto {
  id: string;
  title: string;
  description: string;
  status: string;
  voteCount: number;
  hasVoted: boolean;
  proposedBy: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

function makeIdea(overrides: Partial<IdeaDto> = {}): IdeaDto {
  const now = new Date().toISOString();
  return {
    id: 'i1', title: 'Build a chapel', description: 'Great idea', status: 'Active',
    voteCount: 2, hasVoted: false, proposedBy: 'lead',
    createdAt: now, updatedAt: now, tags: [],
    ...overrides,
  };
}

async function seedUser(page: Page, userId = 'lead'): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate((id) => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[]; userId?: string }) => void;
    };
    win.__setTestToken?.(`${id}-token`);
    win.__setRbac?.({ userId: id, roles: ['CityLead'], permissions: ['Idea:Read', 'Idea:Vote'] });
  }, userId);
}

test('empty /ideas shows lightbulb empty state', async ({ page }) => {
  await page.route('**/api/v1/ideas**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }));

  await seedUser(page);
  const list = new IdeasListPage(page);
  await list.goto();

  await expect(list.emptyState()).toBeVisible();
  await expect(list.emptyState()).toContainText('lightbulb');
});

test('click heart → optimistic increment; vote persists', async ({ page }) => {
  const idea = makeIdea({ voteCount: 2, hasVoted: false });
  const voteCalls: string[] = [];

  await page.route('**/api/v1/ideas**', async (route) => {
    const url = route.request().url();
    if (route.request().method() === 'POST' && url.includes('/vote')) {
      const id = url.split('/ideas/')[1].split('/')[0];
      voteCalls.push(id);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...idea, voteCount: 3, hasVoted: true }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [idea], total: 1 }) });
    }
  });

  await seedUser(page);
  const list = new IdeasListPage(page);
  await list.goto();

  await expect(list.voteCount(0)).toContainText('2');
  await list.voteButton(0).click();

  await expect(list.voteCount(0)).toContainText('3');
  await expect.poll(() => voteCalls.length).toBe(1);
  expect(voteCalls[0]).toBe('i1');
});

test('second click removes vote → snackbar "Vote removed"', async ({ page }) => {
  const idea = makeIdea({ voteCount: 5, hasVoted: true });

  await page.route('**/api/v1/ideas**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...idea, voteCount: 4, hasVoted: false }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [idea], total: 1 }) });
    }
  });

  await seedUser(page);
  const list = new IdeasListPage(page);
  await list.goto();

  await list.voteButton(0).click();

  await expect(list.voteCount(0)).toContainText('4');
  await expect(page.getByTestId('snackbar')).toContainText('Vote removed');
});

test('filter "My ideas" shows only current user ideas', async ({ page }) => {
  const myIdea = makeIdea({ id: 'i1', title: 'My idea', proposedBy: 'lead' });
  const otherIdea = makeIdea({ id: 'i2', title: 'Other idea', proposedBy: 'another-user' });
  let filtered = false;

  await page.route('**/api/v1/ideas**', (route) => {
    const url = route.request().url();
    filtered = url.includes('myIdeas=true');
    const items = filtered ? [myIdea] : [myIdea, otherIdea];
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items, total: items.length }) });
  });

  await seedUser(page);
  const list = new IdeasListPage(page);
  await list.goto();

  await expect(list.ideaCard(0)).toBeVisible();
  await expect(list.ideaCard(1)).toBeVisible();

  await list.filterMyIdeas().click();

  await expect(list.ideaCard(0)).toBeVisible();
  await expect(list.ideaCard(1)).toBeHidden();
});

test('sort "Most votes" orders ideas by vote count desc', async ({ page }) => {
  const ideas = [
    makeIdea({ id: 'i1', title: 'Few votes', voteCount: 1 }),
    makeIdea({ id: 'i2', title: 'Many votes', voteCount: 10 }),
  ];
  let sorted = false;

  await page.route('**/api/v1/ideas**', (route) => {
    const url = route.request().url();
    sorted = url.includes('sort=votes');
    const items = sorted ? [...ideas].sort((a, b) => b.voteCount - a.voteCount) : ideas;
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items, total: items.length }) });
  });

  await seedUser(page);
  const list = new IdeasListPage(page);
  await list.goto();

  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/v1/ideas') && r.url().includes('sort=votes')),
    list.sortSelect().selectOption('votes'),
  ]);

  await expect(list.ideaCard(0)).toContainText('Many votes');
});
