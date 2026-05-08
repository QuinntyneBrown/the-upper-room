// traces_to: L2-107
import { Page, Locator } from '@playwright/test';

export class SessionsCard {
  constructor(private readonly page: Page) {}

  root(): Locator {
    return this.page.getByTestId('sessions-card');
  }

  rows(): Locator {
    return this.page.getByTestId(/^session-row-/);
  }

  row(id: string): Locator {
    return this.page.getByTestId(`session-row-${id}`);
  }

  signOutOthers(): Locator {
    return this.page.getByTestId('sessions-sign-out-others');
  }
}
