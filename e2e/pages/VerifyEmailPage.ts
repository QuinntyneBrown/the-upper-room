// traces_to: L2-018
import { Page, Locator } from '@playwright/test';

export class VerifyEmailPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/verify-email');
  }

  async confirm(token: string): Promise<void> {
    await this.page.goto(`/verify-email/confirm?token=${token}`);
  }

  verifiedHeading(): Locator {
    return this.page.getByTestId('verify-email-verified');
  }

  expiredHeading(): Locator {
    return this.page.getByTestId('verify-email-expired');
  }

  goToDashboard(): Locator {
    return this.page.getByTestId('verify-email-dashboard');
  }

  sendNewLink(): Locator {
    return this.page.getByTestId('verify-email-send-new');
  }

  resendButton(): Locator {
    return this.page.getByTestId('verify-email-resend');
  }

  resendCooldown(): Locator {
    return this.page.getByTestId('verify-email-cooldown');
  }
}
