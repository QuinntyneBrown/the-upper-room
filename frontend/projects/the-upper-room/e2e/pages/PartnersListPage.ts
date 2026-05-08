// traces_to: L2-034, L2-035
import { Page, Locator } from '@playwright/test';

export class PartnersListPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> { await this.page.goto('/partners'); }
  emptyState(): Locator { return this.page.getByTestId('partners-empty-state'); }
  newButton(): Locator { return this.page.getByTestId('partners-new-button'); }
  searchInput(): Locator { return this.page.getByTestId('partners-search'); }
  filterChip(name: string): Locator { return this.page.getByTestId(`partners-filter-${name}`); }
  cardByName(name: string): Locator { return this.page.getByTestId(`partner-card-${name}`); }
  grid(): Locator { return this.page.getByTestId('partners-grid'); }
  fab(): Locator { return this.page.getByTestId('partners-fab'); }
}
