// traces_to: L2-068
import { Page, Locator } from '@playwright/test';

export class ForbiddenPage {
  constructor(private readonly page: Page) {}

  root(): Locator {
    return this.page.getByTestId('forbidden');
  }

  goToDashboard(): Locator {
    return this.page.getByTestId('forbidden-dashboard');
  }

  icon(): Locator {
    return this.page.getByTestId('icon-block');
  }
}
