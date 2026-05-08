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
