// traces_to: L2-107
import { Page, Locator } from '@playwright/test';

export class MyProfilePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/profile');
  }

  firstName(): Locator {
    return this.page.getByTestId('profile-first-name');
  }

  lastName(): Locator {
    return this.page.getByTestId('profile-last-name');
  }

  displayName(): Locator {
    return this.page.getByTestId('profile-display-name');
  }

  pronouns(): Locator {
    return this.page.getByTestId('profile-pronouns');
  }

  title(): Locator {
    return this.page.getByTestId('profile-title');
  }

  city(): Locator {
    return this.page.getByTestId('profile-city');
  }

  timezone(): Locator {
    return this.page.getByTestId('profile-timezone');
  }

  locale(): Locator {
    return this.page.getByTestId('profile-locale');
  }

  saveButton(): Locator {
    return this.page.getByTestId('profile-save');
  }

  cancelButton(): Locator {
    return this.page.getByTestId('profile-cancel');
  }
}
