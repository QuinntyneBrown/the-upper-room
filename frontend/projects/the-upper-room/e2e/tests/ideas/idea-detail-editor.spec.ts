// traces_to: L2-050, L2-051
import { test, expect, Page } from '@playwright/test';
import { IdeaDetailPage } from '../../pages/IdeaDetailPage';
import { MarkdownEditorComponent } from '../../components/MarkdownEditor';

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

function makeDetail(overrides: Partial<IdeaDetailDto> = {}): IdeaDetailDto {
  const now = new Date().toISOString();
  return {
    id: 'idea-1',
    title: 'Build a chapel',
    description: 'Short desc',
    bodyMarkdown: '## Overview\nGreat idea',
    bodyHtmlSanitized: '<h2>Overview</h2><p>Great idea</p>',
    coverImageUrl: 'https://example.com/cover.jpg',
    status: 'Active',
    voteCount: 3,
    hasVoted: false,
    proposedBy: 'lead',
    createdAt: now,
    updatedAt: now,
    tags: [],
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
    win.__setRbac?.({ userId: id, roles: ['CityLead'], permissions: ['Idea:Read', 'Idea:Vote', 'Idea:Edit'] });
  }, userId);
}

test('idea detail renders sanitized HTML body with cover image', async ({ page }) => {
  const detail = makeDetail();

  await page.route('**/api/v1/ideas/idea-1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(detail) }));

  await seedUser(page);
  const detailPage = new IdeaDetailPage(page);
  await detailPage.goto('idea-1');

  await expect(detailPage.title()).toContainText('Build a chapel');
  await expect(detailPage.heroImage()).toHaveAttribute('src', 'https://example.com/cover.jpg');
  await expect(detailPage.body()).toContainText('Overview');
  await expect(detailPage.body()).toContainText('Great idea');
});

test('editor bold toolbar wraps selection in **...**; preview renders bolded', async ({ page }) => {
  const detail = makeDetail({ coverImageUrl: null });

  await page.route('**/api/v1/ideas/idea-1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(detail) }));

  await seedUser(page);
  const detailPage = new IdeaDetailPage(page);
  await detailPage.goto('idea-1');

  await detailPage.editButton().click();

  const editor = new MarkdownEditorComponent(page);
  const textarea = editor.textarea();
  await textarea.fill('hello world');
  await textarea.selectText();
  await editor.toolbarButton('bold').click();

  const value = await textarea.inputValue();
  expect(value).toContain('**hello world**');

  await editor.previewTab().click();
  await expect(editor.previewPane().locator('strong')).toBeVisible();
});

test('image upload of 11MB is rejected with size error', async ({ page }) => {
  const detail = makeDetail({ coverImageUrl: null });

  await page.route('**/api/v1/ideas/idea-1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(detail) }));

  await seedUser(page);
  const detailPage = new IdeaDetailPage(page);
  await detailPage.goto('idea-1');

  await detailPage.editButton().click();

  const editor = new MarkdownEditorComponent(page);
  const oversizedBuffer = Buffer.alloc(11 * 1024 * 1024, 'x');

  await editor.imageInput().setInputFiles({
    name: 'big.jpg',
    mimeType: 'image/jpeg',
    buffer: oversizedBuffer,
  });

  await expect(page.getByTestId('snackbar')).toContainText('Image is too large (max 10MB). Try a smaller image.');
});

test('typing past 10000 chars rejects further input and counter turns error', async ({ page }) => {
  const detail = makeDetail({ coverImageUrl: null });

  await page.route('**/api/v1/ideas/idea-1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(detail) }));

  await seedUser(page);
  const detailPage = new IdeaDetailPage(page);
  await detailPage.goto('idea-1');

  await detailPage.editButton().click();

  const editor = new MarkdownEditorComponent(page);
  const textarea = editor.textarea();

  await textarea.fill('a'.repeat(10000));
  await textarea.press('a');

  const value = await textarea.inputValue();
  expect(value.length).toBe(10000);

  await expect(editor.charCount()).toHaveClass(/error/);
});
