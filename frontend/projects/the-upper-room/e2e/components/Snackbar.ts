// traces_to: L2-061
import { Page, Locator } from '@playwright/test';

export class Snackbar {
  constructor(private readonly page: Page) {}

  root(): Locator {
    return this.page.getByTestId('snackbar');
  }

  message(): Locator {
    return this.page.getByTestId('snackbar-message');
  }

  actionButton(): Locator {
    return this.page.getByTestId('snackbar-action');
  }

  async dismiss(): Promise<void> {
    await this.page.getByTestId('snackbar-dismiss').click();
  }
}
