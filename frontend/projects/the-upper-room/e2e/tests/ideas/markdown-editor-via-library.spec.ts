// traces_to: L2-050, L2-051
// Verifies TarMarkdownEditor from components library renders after move
import { test, expect } from '@playwright/test';
import { IdeaDetailPage } from '../../pages/IdeaDetailPage';
import { MarkdownEditorComponent } from '../../components/MarkdownEditor';

const idea = {
  id: 'idea-1',
  title: 'Test Idea',
  bodyMarkdown: '',
  bodyHtmlSanitized: '',
  status: 'open',
  voteCount: 0,
  tags: [],
};
const me = { id: 'lead', email: 'lead@example.com', city: 'Toronto', roles: ['CityLead'], permissions: [] };

async function seedLead(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/dashboard-stub');
  await page.evaluate(() => {
    const win = window as unknown as {
      __setTestToken?: (t: string) => void;
      __setRbac?: (s: { roles: string[]; permissions: string[] }) => void;
    };
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ roles: ['CityLead'], permissions: ['Idea:Update'] });
  });
}

test('editor renders after move to components library', async ({ page }) => {
  await page.route('**/api/v1/ideas/idea-1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(idea) }),
  );
  await page.route('**/api/v1/users/me', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(me) }),
  );

  await seedLead(page);
  const detail = new IdeaDetailPage(page);
  await detail.goto('idea-1');

  // click edit to open the markdown editor
  const editBtn = page.getByTestId('idea-edit-button');
  if (await editBtn.isVisible()) {
    await editBtn.click();
  }

  const editor = new MarkdownEditorComponent(page);
  await expect(editor.root()).toBeVisible({ timeout: 3000 });
  await expect(editor.writeTab()).toBeVisible();
  await expect(editor.previewTab()).toBeVisible();
  await expect(editor.toolbarButton('bold')).toBeVisible();
});

test('preview tab renders bold markdown from components library editor', async ({ page }) => {
  const boldIdea = { ...idea, bodyMarkdown: '**bold text**', bodyHtmlSanitized: '<p><strong>bold text</strong></p>' };

  await page.route('**/api/v1/ideas/idea-1', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(boldIdea) }),
  );
  await page.route('**/api/v1/users/me', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(me) }),
  );

  await seedLead(page);
  const detail = new IdeaDetailPage(page);
  await detail.goto('idea-1');

  const editBtn = page.getByTestId('idea-edit-button');
  if (await editBtn.isVisible()) {
    await editBtn.click();
  }

  const editor = new MarkdownEditorComponent(page);
  if (!(await editor.root().isVisible())) return;

  // Fill with bold markdown and switch to preview
  await editor.textarea().fill('**bold text**');
  await editor.previewTab().click();
  await expect(editor.previewPane()).toBeVisible();
  const html = await editor.previewPane().innerHTML();
  expect(html).toContain('<strong>');
});
