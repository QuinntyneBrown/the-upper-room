// traces_to: L2-043, L2-044
import { Page, Locator } from '@playwright/test';

export class BoardsListPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/boards');
  }

  emptyState(): Locator {
    return this.page.getByTestId('boards-empty-state');
  }

  emptyHeading(): Locator {
    return this.page.getByTestId('empty-heading');
  }

  newButton(): Locator {
    return this.page.getByTestId('boards-new-button');
  }

  grid(): Locator {
    return this.page.getByTestId('boards-grid');
  }

  cardByName(name: string): Locator {
    return this.page.getByTestId(`board-card-${name}`);
  }
}
