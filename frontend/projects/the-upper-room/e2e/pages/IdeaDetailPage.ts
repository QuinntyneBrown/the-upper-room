// traces_to: L2-050, L2-051
import { Page, Locator } from '@playwright/test';

export class IdeaDetailPage {
  constructor(private readonly page: Page) {}

  async goto(id: string): Promise<void> {
    await this.page.goto(`/ideas/${id}`);
  }

  heroImage(): Locator { return this.page.getByTestId('idea-hero-image'); }
  title(): Locator { return this.page.getByTestId('idea-detail-title'); }
  proposer(): Locator { return this.page.getByTestId('idea-detail-proposer'); }
  body(): Locator { return this.page.getByTestId('idea-detail-body'); }
  voteButton(): Locator { return this.page.getByTestId('idea-detail-vote'); }
  editButton(): Locator { return this.page.getByTestId('idea-detail-edit'); }
  submitButton(): Locator { return this.page.getByTestId('idea-submit-button'); }
  statusSelect(): Locator { return this.page.getByTestId('idea-status-select'); }
  statusChip(): Locator { return this.page.getByTestId('idea-status-chip'); }
}
