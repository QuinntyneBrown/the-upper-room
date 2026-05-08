// traces_to: L2-015
import { Page } from '@playwright/test';

export class AuthCallbackPage {
  constructor(private readonly page: Page) {}

  async gotoWithCode(code: string, state: string): Promise<void> {
    await this.page.goto(`/auth/callback?code=${code}&state=${state}`);
  }
}
