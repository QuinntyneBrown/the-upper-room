// traces_to: L2-084, L2-066
import { Page, Locator } from '@playwright/test';

export class EchoTestPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/echo-test');
  }

  triggerSuccess(): Promise<void> {
    return this.page.getByTestId('echo-get').click();
  }

  triggerRetry(): Promise<void> {
    return this.page.getByTestId('echo-get').click();
  }

  triggerPostFailure(): Promise<void> {
    return this.page.getByTestId('echo-post').click();
  }

  result(): Locator {
    return this.page.getByTestId('echo-result');
  }

  lastCorrelationIdShown(): Locator {
    return this.page.getByTestId('echo-correlation-id');
  }

  snackbar(): Locator {
    return this.page.getByTestId('snackbar');
  }
}
