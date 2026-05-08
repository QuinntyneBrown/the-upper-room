// traces_to: L2-048, L2-049
import { Page, Locator } from '@playwright/test';

export class IdeasListPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/ideas');
  }

  emptyState(): Locator { return this.page.getByTestId('idea-list-empty'); }
  ideaCard(index: number): Locator { return this.page.getByTestId('idea-card').nth(index); }
  voteButton(index: number): Locator { return this.ideaCard(index).getByTestId('idea-vote-button'); }
  voteCount(index: number): Locator { return this.ideaCard(index).getByTestId('idea-vote-count'); }
  filterMyIdeas(): Locator { return this.page.getByTestId('idea-filter-my-ideas'); }
  sortSelect(): Locator { return this.page.getByTestId('idea-sort-select'); }
}
