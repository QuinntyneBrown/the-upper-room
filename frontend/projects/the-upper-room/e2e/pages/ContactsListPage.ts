// traces_to: L2-029, L2-030
import { Page, Locator } from '@playwright/test';

export class ContactsListPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> { await this.page.goto('/contacts'); }
  emptyState(): Locator { return this.page.getByTestId('contacts-empty-state'); }
  emptyStateActionButton(): Locator { return this.page.getByTestId('contacts-new-button'); }
  searchInput(): Locator { return this.page.getByTestId('contacts-search'); }
  filterChip(name: string): Locator { return this.page.getByTestId(`contacts-filter-${name}`); }
  cardByName(name: string): Locator { return this.page.getByTestId(`contact-card-${name}`); }
  fab(): Locator { return this.page.getByTestId('contacts-fab'); }
  grid(): Locator { return this.page.getByTestId('contacts-grid'); }
}
