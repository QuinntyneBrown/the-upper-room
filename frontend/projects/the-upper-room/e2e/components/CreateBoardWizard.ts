// traces_to: L2-043, L2-044
import { Page, Locator } from '@playwright/test';

export class CreateBoardWizard {
  constructor(private readonly page: Page) {}

  root(): Locator {
    return this.page.getByTestId('create-board-wizard');
  }

  nameInput(): Locator {
    return this.page.getByTestId('create-board-name');
  }

  descriptionInput(): Locator {
    return this.page.getByTestId('create-board-description');
  }

  defaultColumnsToggle(): Locator {
    return this.page.getByTestId('create-board-default-columns');
  }

  submit(): Locator {
    return this.page.getByTestId('create-board-submit');
  }

  cancel(): Locator {
    return this.page.getByTestId('create-board-cancel');
  }
}
