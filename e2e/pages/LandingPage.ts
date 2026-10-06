// traces_to: L2-074
import { Page, Locator } from '@playwright/test';

export class LandingPage {
  readonly appName: Locator;

  constructor(private readonly page: Page) {
    this.appName = page.getByRole('heading', { level: 1, name: 'The Upper Room' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }
}
