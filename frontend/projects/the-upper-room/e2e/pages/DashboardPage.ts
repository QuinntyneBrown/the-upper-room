// traces_to: L2-059
import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> { await this.page.goto('/dashboard'); }

  welcomeHeader(): Locator { return this.page.getByTestId('dashboard-welcome'); }
  statCard(name: string): Locator { return this.page.getByTestId(`stat-card-${name}`); }
  statCount(name: string): Locator { return this.page.getByTestId(`stat-count-${name}`); }
  upcomingEventsWidget(): Locator { return this.page.getByTestId('dashboard-upcoming-events'); }
  upcomingEventItem(id: string): Locator { return this.page.getByTestId(`upcoming-event-${id}`); }
  viewCalendarLink(): Locator { return this.page.getByTestId('dashboard-view-calendar'); }
  myBoardsWidget(): Locator { return this.page.getByTestId('dashboard-my-boards'); }
  boardGroup(boardId: string): Locator { return this.page.getByTestId(`board-group-${boardId}`); }
}
