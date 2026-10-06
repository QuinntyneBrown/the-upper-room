// traces_to: L2-057, L2-058
import { Page, Locator } from '@playwright/test';

export class LocationsListPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> { await this.page.goto('/locations'); }

  emptyState(): Locator { return this.page.getByTestId('locations-empty-state'); }
  newButton(): Locator { return this.page.getByTestId('locations-new-button'); }
  grid(): Locator { return this.page.getByTestId('locations-grid'); }
  locationCard(index: number): Locator { return this.page.getByTestId('location-card').nth(index); }
  deleteButton(index: number): Locator { return this.locationCard(index).getByTestId('location-delete'); }
}
