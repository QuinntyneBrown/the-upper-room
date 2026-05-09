// traces_to: L2-062
import { Page, Locator } from '@playwright/test';

export class NotificationBell {
  constructor(private readonly page: Page) {}

  bell(): Locator { return this.page.getByTestId('notification-bell'); }
  badge(): Locator { return this.page.getByTestId('notification-badge'); }
  menu(): Locator { return this.page.getByTestId('notification-menu'); }
  emptyState(): Locator { return this.page.getByTestId('notification-empty'); }

  unreadTab(): Locator { return this.page.getByTestId('notification-tab-unread'); }
  allTab(): Locator { return this.page.getByTestId('notification-tab-all'); }

  rows(): Locator { return this.page.getByTestId('notification-row'); }
  row(index: number): Locator { return this.rows().nth(index); }

  markAllRead(): Locator { return this.page.getByTestId('notification-mark-all-read'); }
  settingsLink(): Locator { return this.page.getByTestId('notification-settings-link'); }

  async open(): Promise<void> { await this.bell().click(); }
}
