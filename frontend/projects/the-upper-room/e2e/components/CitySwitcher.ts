// traces_to: L2-109
import { Page, Locator } from '@playwright/test';

export class CitySwitcher {
  constructor(private readonly page: Page) {}

  trigger(): Locator {
    return this.page.getByTestId('city-switcher-trigger');
  }

  menu(): Locator {
    return this.page.getByTestId('city-switcher-menu');
  }

  option(slug: string): Locator {
    return this.page.getByTestId(`city-switcher-option-${slug}`);
  }

  allCities(): Locator {
    return this.page.getByTestId('city-switcher-option-all');
  }

  banner(): Locator {
    return this.page.getByTestId('city-switcher-all-banner');
  }
}
