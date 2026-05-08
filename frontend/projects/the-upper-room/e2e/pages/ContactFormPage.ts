// traces_to: L2-032
import { Page, Locator } from '@playwright/test';

export class ContactFormPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> { await this.page.goto('/contacts/new'); }
  firstName(): Locator { return this.page.getByTestId('contact-first-name'); }
  lastName(): Locator { return this.page.getByTestId('contact-last-name'); }
  pronouns(): Locator { return this.page.getByTestId('contact-pronouns'); }
  title(): Locator { return this.page.getByTestId('contact-title'); }
  org(): Locator { return this.page.getByTestId('contact-org'); }
  displayName(): Locator { return this.page.getByTestId('contact-display-name'); }
  submit(): Locator { return this.page.getByTestId('contact-submit'); }
  cancel(): Locator { return this.page.getByTestId('contact-cancel'); }
  unsavedDot(): Locator { return this.page.getByTestId('contact-unsaved-dot'); }
  firstNameError(): Locator { return this.page.getByTestId('contact-error-first-name'); }
}
