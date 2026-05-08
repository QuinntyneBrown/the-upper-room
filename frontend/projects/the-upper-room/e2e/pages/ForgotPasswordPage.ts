// traces_to: L2-020
import { Page, Locator } from '@playwright/test';

export class ForgotPasswordPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/forgot-password');
  }

  emailInput(): Locator {
    return this.page.getByTestId('forgot-email');
  }

  submitButton(): Locator {
    return this.page.getByTestId('forgot-submit');
  }

  message(): Locator {
    return this.page.getByTestId('forgot-message');
  }
}
