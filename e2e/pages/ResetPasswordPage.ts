// traces_to: L2-020
import { Page, Locator } from '@playwright/test';

export class ResetPasswordPage {
  constructor(private readonly page: Page) {}

  async goto(token: string): Promise<void> {
    await this.page.goto(`/reset-password?token=${token}`);
  }

  newPassword(): Locator {
    return this.page.getByTestId('reset-new-password');
  }

  confirmPassword(): Locator {
    return this.page.getByTestId('reset-confirm-password');
  }

  submitButton(): Locator {
    return this.page.getByTestId('reset-submit');
  }

  errorFor(field: 'confirm' | 'form'): Locator {
    return this.page.getByTestId(`reset-error-${field}`);
  }

  expiredHeading(): Locator {
    return this.page.getByTestId('reset-expired');
  }
}
