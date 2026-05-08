// traces_to: L2-106
import { Page, Locator } from '@playwright/test';

export class AvatarUploader {
  constructor(private readonly page: Page) {}

  initials(): Locator {
    return this.page.getByTestId('avatar-initials');
  }

  image(): Locator {
    return this.page.getByTestId('avatar-image');
  }

  fileInput(): Locator {
    return this.page.getByTestId('avatar-file-input');
  }
}
