// traces_to: L2-060
import { Page, Locator } from '@playwright/test';

export class GlobalSearchDialog {
  constructor(private readonly page: Page) {}

  dialog(): Locator { return this.page.getByTestId('global-search-dialog'); }
  input(): Locator { return this.page.getByTestId('global-search-input'); }
  result(id: string): Locator { return this.page.getByTestId(`search-result-${id}`); }
  emptyState(): Locator { return this.page.getByTestId('global-search-empty'); }

  async open(): Promise<void> {
    await this.page.keyboard.press('Control+k');
  }

  async close(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async typeQuery(q: string): Promise<void> {
    await this.input().fill(q);
  }
}
