// traces_to: L2-026
import { Page, Locator } from '@playwright/test';

export class UserListPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/admin/users');
  }

  searchInput(): Locator {
    return this.page.getByTestId('user-search');
  }

  filterChip(name: string): Locator {
    return this.page.getByTestId(`user-filter-${name}`);
  }

  row(email: string): Locator {
    return this.page.getByTestId(`user-row-${email}`);
  }

  rows(): Locator {
    return this.page.getByTestId(/^user-row-/);
  }

  paginator(): Locator {
    return this.page.getByTestId('user-paginator');
  }

  pageSize(): Locator {
    return this.page.getByTestId('user-page-size');
  }

  async selectPageSize(value: string): Promise<void> {
    await this.pageSize().click();
    await this.page.locator('mat-option').filter({ hasText: value }).click();
  }

  inviteButton(): Locator {
    return this.page.getByTestId('user-invite');
  }

  emptyState(): Locator {
    return this.page.getByTestId('user-empty');
  }
}
