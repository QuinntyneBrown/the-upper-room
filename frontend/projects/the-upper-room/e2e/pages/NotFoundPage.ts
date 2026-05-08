// traces_to: L2-067
import { Page, Locator } from '@playwright/test';

export class NotFoundPage {
  constructor(private readonly page: Page) {}

  root(): Locator {
    return this.page.getByTestId('not-found');
  }

  heading(): Locator {
    return this.page.getByTestId('not-found-heading');
  }

  icon(): Locator {
    return this.page.getByTestId('icon-search-off');
  }
}
