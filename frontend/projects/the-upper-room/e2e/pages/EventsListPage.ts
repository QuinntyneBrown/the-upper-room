// traces_to: L2-052, L2-053
import { Page, Locator } from '@playwright/test';

export class EventsListPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> { await this.page.goto('/events'); }

  emptyState(): Locator { return this.page.getByTestId('event-list-empty'); }
  eventCard(id: string): Locator { return this.page.getByTestId(`event-card-${id}`); }
  allCards(): Locator { return this.page.locator('[data-testid^="event-card-"]'); }
  statusFilter(): Locator { return this.page.getByTestId('events-filter-status'); }
  viewToggle(): Locator { return this.page.getByTestId('events-view-toggle'); }
  calendarView(): Locator { return this.page.getByTestId('events-calendar-view'); }
}
