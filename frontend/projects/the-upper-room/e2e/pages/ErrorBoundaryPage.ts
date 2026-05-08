// traces_to: L2-069
import { Page, Locator } from '@playwright/test';

export class ErrorBoundaryPage {
  constructor(private readonly page: Page) {}

  root(): Locator {
    return this.page.getByTestId('error-boundary');
  }

  correlationId(): Locator {
    return this.page.getByTestId('error-boundary-correlation');
  }

  copyButton(): Locator {
    return this.page.getByTestId('error-boundary-copy');
  }

  reloadButton(): Locator {
    return this.page.getByTestId('error-boundary-reload');
  }
}
