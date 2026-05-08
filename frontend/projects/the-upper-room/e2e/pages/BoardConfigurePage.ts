// traces_to: L2-047
import { Page, Locator } from '@playwright/test';

export class BoardConfigurePage {
  constructor(private readonly page: Page) {}

  async goto(boardId: string): Promise<void> {
    await this.page.goto(`/boards/${boardId}/configure`);
  }

  columnRow(name: string): Locator {
    return this.page.getByTestId(`config-column-row-${name}`);
  }

  deleteColumnButton(name: string): Locator {
    return this.page.getByTestId(`config-column-delete-${name}`);
  }

  moveCardsDialog(): Locator {
    return this.page.getByTestId('config-move-cards-dialog');
  }

  moveCardsTarget(): Locator {
    return this.page.getByTestId('config-move-cards-target');
  }

  moveCardsConfirm(): Locator {
    return this.page.getByTestId('config-move-cards-confirm');
  }
}
