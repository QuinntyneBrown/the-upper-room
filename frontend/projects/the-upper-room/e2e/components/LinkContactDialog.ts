// traces_to: L2-036
import { Page, Locator } from '@playwright/test';

export class LinkContactDialog {
  constructor(private readonly page: Page) {}

  dialog(): Locator { return this.page.getByTestId('link-contact-dialog'); }
  searchInput(): Locator { return this.page.getByTestId('link-contact-search'); }
  roleInput(): Locator { return this.page.getByTestId('link-contact-role'); }
  result(name: string): Locator { return this.page.getByTestId(`link-contact-result-${name}`); }
  confirmButton(): Locator { return this.page.getByTestId('link-contact-confirm'); }
  cancelButton(): Locator { return this.page.getByTestId('link-contact-cancel'); }
}
