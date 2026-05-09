// traces_to: L2-064
import { Page, Locator } from '@playwright/test';

export class NotificationPreferencesPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> { await this.page.goto('/settings/notifications'); }

  rows(): Locator { return this.page.locator('[data-testid^="pref-row-"]'); }
  row(code: string): Locator { return this.page.getByTestId(`pref-row-${code}`); }

  toggle(code: string, channel: 'inApp' | 'email' | 'push'): Locator {
    return this.row(code).getByTestId(`pref-toggle-${channel}`);
  }

  savedIndicator(code: string): Locator {
    return this.row(code).getByTestId('pref-saved');
  }
}
