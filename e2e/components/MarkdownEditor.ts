// traces_to: L2-050, L2-051
import { Page, Locator } from '@playwright/test';

export class MarkdownEditorComponent {
  constructor(private readonly page: Page) {}

  root(): Locator { return this.page.getByTestId('markdown-editor'); }
  textarea(): Locator { return this.page.getByTestId('markdown-editor-textarea'); }
  charCount(): Locator { return this.page.getByTestId('markdown-editor-char-count'); }
  toolbarButton(action: string): Locator { return this.page.getByTestId(`markdown-toolbar-${action}`); }
  previewTab(): Locator { return this.page.getByTestId('markdown-tab-preview'); }
  writeTab(): Locator { return this.page.getByTestId('markdown-tab-write'); }
  previewPane(): Locator { return this.page.getByTestId('markdown-preview-pane'); }
  imageInput(): Locator { return this.page.getByTestId('markdown-image-input'); }
}
