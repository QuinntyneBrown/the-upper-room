// traces_to: L2-115
import { Page, Locator } from '@playwright/test';

export class AppearanceSettingsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/settings/appearance');
  }

  option(theme: 'system' | 'light' | 'dark'): Locator {
    return this.page.getByTestId(`theme-option-${theme}`);
  }
}
