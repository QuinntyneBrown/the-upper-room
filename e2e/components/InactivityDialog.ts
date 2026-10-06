// traces_to: L2-022
import { Page, Locator } from '@playwright/test';

export class InactivityDialog {
  constructor(private readonly page: Page) {}

  root(): Locator {
    return this.page.getByTestId('inactivity-dialog');
  }

  countdown(): Locator {
    return this.page.getByTestId('inactivity-countdown');
  }

  staySignedIn(): Locator {
    return this.page.getByTestId('inactivity-stay');
  }
}
