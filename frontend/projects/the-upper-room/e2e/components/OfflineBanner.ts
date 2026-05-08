// traces_to: L2-070
import { Page, Locator } from '@playwright/test';

export class OfflineBanner {
  constructor(private readonly page: Page) {}

  root(): Locator {
    return this.page.getByTestId('offline-banner');
  }

  text(): Locator {
    return this.page.getByTestId('offline-banner-text');
  }

  closeBtn(): Locator {
    return this.page.getByTestId('offline-banner-close');
  }
}
