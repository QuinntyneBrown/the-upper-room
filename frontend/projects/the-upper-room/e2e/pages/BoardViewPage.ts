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

  card(title: string): Locator {
    return this.page.getByTestId(`board-card-${title}`);
  }

  tagFilterChip(tagName: string): Locator {
    return this.page.getByTestId(`board-tag-filter-${tagName}`);
  }
}
