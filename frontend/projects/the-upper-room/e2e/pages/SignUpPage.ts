// traces_to: L2-017
import { Page, Locator } from '@playwright/test';

export class SignUpPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/sign-up');
  }

  async gotoInvitation(token: string): Promise<void> {
    await this.page.goto(`/invitations/accept?token=${token}`);
  }

  emailInput(): Locator {
    return this.page.getByTestId('sign-up-email');
  }

  passwordInput(): Locator {
    return this.page.getByTestId('sign-up-password');
  }

  cityInput(): Locator {
    return this.page.getByTestId('sign-up-city');
  }

  termsCheckbox(): Locator {
    return this.page.getByTestId('sign-up-terms');
  }

  submitButton(): Locator {
    return this.page.getByTestId('sign-up-submit');
  }

  errorFor(field: 'email' | 'password' | 'form'): Locator {
    return this.page.getByTestId(`sign-up-error-${field}`);
  }

  signInLink(): Locator {
    return this.page.getByTestId('sign-up-sign-in-link');
  }

  expiredCard(): Locator {
    return this.page.getByTestId('invitation-expired');
  }

  requestNewInvite(): Locator {
    return this.page.getByTestId('invitation-request-new');
  }
}
