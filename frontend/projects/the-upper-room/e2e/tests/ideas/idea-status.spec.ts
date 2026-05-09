// traces_to: L2-048, L2-050
import { test, expect, Page } from '@playwright/test';
import { IdeaDetailPage } from '../../pages/IdeaDetailPage';

interface IdeaDetailDto {
  id: string;
  title: string;
  description: string;
  bodyMarkdown: string;
  bodyHtmlSanitized: string;
  coverImageUrl: string | null;
  status: string;
  voteCount: number;
  hasVoted: boolean;
  proposedBy: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

function makeIdea(overrides: Partial<IdeaDetailDto> = {}): IdeaDetailDto {
  const now = new Date().toISOString();
  return {
    id: 'idea-1',
    title: 'Build a chapel',
    description: 'Short desc',
    bodyMarkdown: '',
    bodyHtmlSanitized: '',
    coverImageUrl: null,
    status: 'Draft',
    voteCount: 0,
    hasVoted: false,
    proposedBy: 'member',
    createdAt: now,
    updatedAt: now,
    tags: [],
    ...overrides,
  };
}

async function seedUser(page: Page, userId: string, roles: string[], permissions: string[]): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate(([id, r, p]) => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[]; userId?: string }) => void;
    };
    win.__setTestToken?.(`${id}-token`);
    win.__setRbac?.({ userId: id as string, roles: r as string[], permissions: p as string[] });
  }, [userId, roles, permissions]);
}

test('proposer on Draft idea sees Submit button; clicking it changes status and hides status select', async ({ page }) => {
  const idea = makeIdea({ status: 'Draft', proposedBy: 'member' });

  await page.route('**/api/v1/ideas/idea-1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(idea) }));

  await page.route('**/api/v1/ideas/idea-1/status', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...idea, status: 'Submitted' }) }));

  await seedUser(page, 'member', ['Member'], ['Idea:Read', 'Idea:Submit']);

  const detailPage = new IdeaDetailPage(page);
  await detailPage.goto('idea-1');

  await expect(detailPage.submitButton()).toBeVisible();

  await detailPage.submitButton().click();

  await expect(detailPage.statusChip()).toContainText('Submitted');
  await expect(detailPage.statusSelect()).toBeHidden();
});

test('CityLead changes Submitted→Selected via status dropdown; chip updates', async ({ page }) => {
  const idea = makeIdea({ status: 'Submitted', proposedBy: 'member' });

  await page.route('**/api/v1/ideas/idea-1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(idea) }));

  await page.route('**/api/v1/ideas/idea-1/status', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...idea, status: 'Selected' }) }));

  await seedUser(page, 'lead', ['CityLead'], ['Idea:Read', 'Idea:Manage']);

  const detailPage = new IdeaDetailPage(page);
  await detailPage.goto('idea-1');

  await expect(detailPage.statusSelect()).toBeVisible();
  await detailPage.statusSelect().selectOption('Selected');

  await expect(detailPage.statusChip()).toContainText('Selected');
});

test('invalid status transition returns 422 and shows error snackbar', async ({ page }) => {
  const idea = makeIdea({ status: 'Draft', proposedBy: 'member' });

  await page.route('**/api/v1/ideas/idea-1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(idea) }));

  await page.route('**/api/v1/ideas/idea-1/status', (r) =>
    r.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ error: 'Invalid status transition.' }) }));

  await seedUser(page, 'lead', ['CityLead'], ['Idea:Read', 'Idea:Manage']);

  const detailPage = new IdeaDetailPage(page);
  await detailPage.goto('idea-1');

  await expect(detailPage.statusSelect()).toBeVisible();
  await detailPage.statusSelect().selectOption('InProgress');

  await expect(page.getByTestId('snackbar')).toContainText('Invalid status transition.');
});
