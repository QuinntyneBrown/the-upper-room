// traces_to: L2-045
import { Page, Locator } from '@playwright/test';

export class BoardViewPage {
  constructor(private readonly page: Page) {}

  async goto(boardId: string): Promise<void> {
    await this.page.goto(`/boards/${boardId}`);
  }

  header(): Locator {
    return this.page.getByTestId('board-view-header');
  }

  columnsContainer(): Locator {
    return this.page.getByTestId('board-view-columns');
  }

  column(name: string): Locator {
    return this.page.getByTestId(`board-column-${name}`);
  }

  /** A card by its title or its id. */
  card(titleOrId: string): Locator {
    return this.page.locator(`[data-testid="board-card-${titleOrId}"], [data-card-id="${titleOrId}"]`);
  }

  tagFilterChip(tagName: string): Locator {
    return this.page.getByTestId(`board-tag-filter-${tagName}`);
  }

  async dragCardTo(cardTitle: string, targetColumn: string): Promise<void> {
    await this.card(cardTitle).dragTo(this.column(targetColumn));
  }

  showArchivedToggle(): Locator {
    return this.page.getByTestId('board-show-archived');
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }
}
