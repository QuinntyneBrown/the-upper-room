// traces_to: L2-098
import { Page, Locator } from '@playwright/test';

export class AuditLogPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> { await this.page.goto('/admin/audit'); }

  table(): Locator { return this.page.getByTestId('audit-log-table'); }
  rows(): Locator { return this.page.getByTestId('audit-log-row'); }
  row(index: number): Locator { return this.rows().nth(index); }
  emptyState(): Locator { return this.page.getByTestId('audit-log-empty'); }

  actionFilter(): Locator { return this.page.getByTestId('audit-filter-action'); }
  actorFilter(): Locator { return this.page.getByTestId('audit-filter-actor'); }
  entityTypeFilter(): Locator { return this.page.getByTestId('audit-filter-entity-type'); }
  applyButton(): Locator { return this.page.getByTestId('audit-filter-apply'); }

  prevButton(): Locator { return this.page.getByTestId('audit-page-prev'); }
  nextButton(): Locator { return this.page.getByTestId('audit-page-next'); }

  async selectAction(value: string): Promise<void> {
    await this.actionFilter().click();
    await this.page.locator('mat-option').filter({ hasText: value }).click();
  }
}
