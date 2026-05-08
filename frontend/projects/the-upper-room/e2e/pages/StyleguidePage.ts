// traces_to: L2-001..L2-006
import { Page, Locator } from '@playwright/test';

export class StyleguidePage {
  readonly seedButton: Locator;
  readonly seedCard: Locator;
  readonly seedChip: Locator;

  constructor(private readonly page: Page) {
    this.seedButton = page.getByTestId('seed-button');
    this.seedCard = page.getByTestId('seed-card');
    this.seedChip = page.getByTestId('seed-chip');
  }

  iconByAlias(alias: string): Locator {
    return this.page.getByTestId(`icon-${alias}`);
  }

  gridDemo(): Locator {
    return this.page.getByTestId('grid-demo');
  }

  cardCount(): Locator {
    return this.page.getByTestId('grid-demo').locator('> *');
  }

  snackbarTrigger(kind: 'info' | 'success' | 'warning' | 'error' | 'with-undo' | 'queue-pair'): Locator {
    return this.page.getByTestId(`snackbar-trigger-${kind}`);
  }

  confirmTrigger(kind: 'info' | 'warning' | 'danger-typed'): Locator {
    return this.page.getByTestId(`confirm-trigger-${kind}`);
  }

  emptyDemo(): Locator {
    return this.page.getByTestId('empty-demo');
  }

  skeletonDemo(): Locator {
    return this.page.getByTestId('skeleton-demo');
  }

  errorDemo(): Locator {
    return this.page.getByTestId('error-demo');
  }

  async goto(): Promise<void> {
    await this.page.goto('/styleguide');
  }

  async cssVar(name: string): Promise<string> {
    return this.page.evaluate(
      (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
      name,
    );
  }

  async setTheme(theme: 'light' | 'dark'): Promise<void> {
    await this.page.evaluate((t) => {
      if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
      else document.documentElement.removeAttribute('data-theme');
    }, theme);
  }
}
