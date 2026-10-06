// traces_to: L2-040
import { Page, Locator } from '@playwright/test';

export class TagSelector {
  constructor(private readonly page: Page) {}

  root(): Locator { return this.page.getByTestId('tag-selector'); }
  input(): Locator { return this.page.getByTestId('tag-selector-input'); }
  createHint(): Locator { return this.page.getByTestId('tag-selector-create-hint'); }
  suggestion(id: string): Locator { return this.page.getByTestId(`tag-suggestion-${id}`); }
  dot(id: string): Locator { return this.page.getByTestId(`tag-suggestion-dot-${id}`); }
  selectedTag(id: string): Locator { return this.page.getByTestId(`tag-selected-${id}`); }
  removeTag(id: string): Locator { return this.page.getByTestId(`tag-remove-${id}`); }
}
