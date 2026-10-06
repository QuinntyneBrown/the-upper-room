// traces_to: L2-019
import { Page, Locator } from '@playwright/test';

export class PasswordStrengthMeter {
  constructor(private readonly page: Page) {}

  bars(): Locator {
    return this.page.getByTestId('password-strength-bar');
  }

  filledBars(): Locator {
    return this.page.locator('[data-testid="password-strength-bar"].tar-password-strength__bar--filled');
  }

  label(): Locator {
    return this.page.getByTestId('password-strength-label');
  }

  helperText(): Locator {
    return this.page.getByTestId('password-strength-helper');
  }
}
