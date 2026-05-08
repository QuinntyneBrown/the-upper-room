// traces_to: L2-099
import { Page, Locator } from '@playwright/test';

export class ConfirmDialog {
  constructor(private readonly page: Page) {}

  root(): Locator {
    return this.page.getByTestId('confirm-dialog');
  }

  title(): Locator {
    return this.page.getByTestId('confirm-title');
  }

  body(): Locator {
    return this.page.getByTestId('confirm-body');
  }

  confirmButton(): Locator {
    return this.page.getByTestId('confirm-button');
  }

  cancelButton(): Locator {
    return this.page.getByTestId('confirm-cancel');
  }

  typedInput(): Locator {
    return this.page.getByTestId('confirm-typed-input');
  }
}
