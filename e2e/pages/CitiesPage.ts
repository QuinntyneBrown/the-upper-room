// traces_to: L2-077
import { Page, Locator } from '@playwright/test';

export class CitiesPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/admin/cities');
  }

  newButton(): Locator {
    return this.page.getByTestId('cities-new');
  }

  nameInput(): Locator {
    return this.page.getByTestId('cities-name');
  }

  countryInput(): Locator {
    return this.page.getByTestId('cities-country');
  }

  saveButton(): Locator {
    return this.page.getByTestId('cities-save');
  }

  formError(): Locator {
    return this.page.getByTestId('cities-form-error');
  }

  row(slug: string): Locator {
    return this.page.getByTestId(`city-row-${slug}`);
  }

  archive(slug: string): Locator {
    return this.page.getByTestId(`city-archive-${slug}`);
  }
}
