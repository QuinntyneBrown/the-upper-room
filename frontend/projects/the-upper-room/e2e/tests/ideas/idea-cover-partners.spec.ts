// traces_to: L2-051, L2-048
import { test, expect } from '@playwright/test';
import { IdeaDetailPage } from '../../pages/IdeaDetailPage';

const idea = {
  id: 'i1',
  title: 'Build a youth centre',
  description: 'A place for youth',
  bodyMarkdown: '# Youth centre',
  bodyHtmlSanitized: '<h1>Youth centre</h1>',
  coverImageUrl: null as string | null,
  status: 'Draft',
  voteCount: 0,
  hasVoted: false,
  proposedBy: 'lead',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  tags: [],
  linkedPartners: [] as { id: string; name: string }[],
};

const partner1 = { id: 'p1', name: 'Grace Church', website: 'https://grace.org', cityId: 'Toronto' };
const partner2 = { id: 'p2', name: 'City Outreach', website: '', cityId: 'Toronto' };

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Idea:Edit', 'Partner:Read'] });
  });
  await page.route('/api/v1/notifications**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) });
  });
  await page.route('/api/v1/users/me', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'lead', roles: ['CityLead'] }) });
  });
}

test('upload 16:9 image as cover → renders on idea detail hero and list card', async ({ page }) => {
  let coverUrl: string | null = null;

  await page.route('**/api/v1/ideas/i1/cover', (route) => {
    coverUrl = 'https://example.com/cover.jpg';
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...idea, coverImageUrl: coverUrl }) });
  });
  await page.route('**/api/v1/ideas/i1', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...idea, coverImageUrl: coverUrl }) });
  });
  await page.route('**/api/v1/ideas**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [{ ...idea, coverImageUrl: coverUrl }], total: 1 }) });
  });

  await seedLead(page);
  const detail = new IdeaDetailPage(page);
  await detail.goto('i1');

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByTestId('idea-cover-upload-button').click(),
  ]);
  await fileChooser.setFiles({ name: 'cover.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });

  await expect(detail.heroImage()).toBeVisible();
  await expect(detail.heroImage()).toHaveAttribute('src', /cover/);

  await page.goto('/ideas');
  await expect(page.getByTestId('idea-card-cover-i1')).toBeVisible();
});

test('link two partners → cards visible; clicking navigates to partner detail', async ({ page }) => {
  const linkedPartners: { id: string; name: string }[] = [];

  await page.route('**/api/v1/ideas/i1/partners', (route) => {
    if (route.request().method() === 'POST') {
      const body = JSON.parse(route.request().postData() ?? '{}') as { partnerId: string };
      const match = [partner1, partner2].find((p) => p.id === body.partnerId);
      if (match) linkedPartners.push({ id: match.id, name: match.name });
      void route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ partnerId: body.partnerId }) });
    } else {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: linkedPartners }) });
    }
  });
  await page.route('**/api/v1/ideas/i1', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...idea, linkedPartners }) });
  });
  await page.route('**/api/v1/partners**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [partner1, partner2], total: 2 }) });
  });

  await seedLead(page);
  const detail = new IdeaDetailPage(page);
  await detail.goto('i1');

  await page.getByTestId('idea-link-partner-button').click();
  await page.getByTestId('idea-partner-search').fill('Grace');
  await page.getByTestId('idea-partner-result-Grace Church').click();

  await page.getByTestId('idea-link-partner-button').click();
  await page.getByTestId('idea-partner-search').fill('City');
  await page.getByTestId('idea-partner-result-City Outreach').click();

  await expect(page.getByTestId('idea-partner-card-p1')).toBeVisible();
  await expect(page.getByTestId('idea-partner-card-p2')).toBeVisible();

  await page.route('**/api/v1/partners/p1**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...partner1, contactCount: 0, tags: [], archived: false, logo: null, descriptionMarkdown: null, addresses: [], socialLinks: [] }) });
  });
  await page.getByTestId('idea-partner-card-p1').click();
  await expect(page).toHaveURL(/\/partners\/p1/);
});

test('removing a partner link removes only that link', async ({ page }) => {
  const linked = [
    { id: 'p1', name: 'Grace Church' },
    { id: 'p2', name: 'City Outreach' },
  ];

  await page.route('**/api/v1/ideas/i1/partners/p1', (route) => {
    void route.fulfill({ status: 204, body: '' });
  });
  await page.route('**/api/v1/ideas/i1/partners', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: linked }) });
  });
  await page.route('**/api/v1/ideas/i1', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...idea, linkedPartners: linked }) });
  });

  await seedLead(page);
  const detail = new IdeaDetailPage(page);
  await detail.goto('i1');

  await expect(page.getByTestId('idea-partner-card-p1')).toBeVisible();
  await expect(page.getByTestId('idea-partner-card-p2')).toBeVisible();

  await page.getByTestId('idea-unlink-partner-p1').click();

  await expect(page.getByTestId('idea-partner-card-p1')).not.toBeVisible();
  await expect(page.getByTestId('idea-partner-card-p2')).toBeVisible();
});
