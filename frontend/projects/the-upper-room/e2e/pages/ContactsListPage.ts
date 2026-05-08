// traces_to: L2-029
import { Page, Locator } from '@playwright/test';

export class ContactsListPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> { await this.page.goto('/contacts'); }
  emptyState(): Locator { return this.page.getByTestId('contacts-empty-state'); }
  emptyStateActionButton(): Locator { return this.page.getByTestId('contacts-new-button'); }
}
