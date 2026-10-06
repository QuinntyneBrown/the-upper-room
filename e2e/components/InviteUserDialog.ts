// traces_to: L2-027
import { Page, Locator } from '@playwright/test';

export class InviteUserDialog {
  constructor(private readonly page: Page) {}

  root(): Locator {
    return this.page.getByTestId('invite-dialog');
  }

  email(): Locator {
    return this.page.getByTestId('invite-email');
  }

  firstName(): Locator {
    return this.page.getByTestId('invite-first-name');
  }

  lastName(): Locator {
    return this.page.getByTestId('invite-last-name');
  }

  role(): Locator {
    return this.page.getByTestId('invite-role');
  }

  city(): Locator {
    return this.page.getByTestId('invite-city');
  }

  message(): Locator {
    return this.page.getByTestId('invite-message');
  }

  submit(): Locator {
    return this.page.getByTestId('invite-submit');
  }

  cancel(): Locator {
    return this.page.getByTestId('invite-cancel');
  }

  emailError(): Locator {
    return this.page.getByTestId('invite-error-email');
  }
}
