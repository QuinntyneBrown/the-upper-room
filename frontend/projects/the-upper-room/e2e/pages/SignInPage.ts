// traces_to: L2-016
import { Page, Locator } from '@playwright/test';

export class SignInPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/sign-in');
  }

  card(): Locator {
    return this.page.getByTestId('sign-in-card');
  }

  emailInput(): Locator {
    return this.page.getByTestId('sign-in-email');
  }

  passwordInput(): Locator {
    return this.page.getByTestId('sign-in-password');
  }

  submitButton(): Locator {
    return this.page.getByTestId('sign-in-submit');
  }

  togglePasswordVisibility(): Locator {
    return this.page.getByTestId('sign-in-toggle-visibility');
  }

  forgotPasswordLink(): Locator {
    return this.page.getByTestId('sign-in-forgot');
  }

  signUpLink(): Locator {
    return this.page.getByTestId('sign-in-signup');
  }

  errorFor(field: 'email' | 'password' | 'form'): Locator {
    return this.page.getByTestId(`sign-in-error-${field}`);
  }

  async submit(email: string, password: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.submitButton().click();
  }
}
