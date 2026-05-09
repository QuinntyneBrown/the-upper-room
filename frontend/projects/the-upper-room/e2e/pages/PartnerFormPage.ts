// traces_to: L2-037
import { Page, Locator } from '@playwright/test';

export class PartnerFormPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> { await this.page.goto('/partners/new'); }
  nameInput(): Locator { return this.page.getByTestId('partner-name'); }
  websiteInput(): Locator { return this.page.getByTestId('partner-website'); }
  submit(): Locator { return this.page.getByTestId('partner-submit'); }
  cancel(): Locator { return this.page.getByTestId('partner-cancel'); }
  unsavedDot(): Locator { return this.page.getByTestId('partner-unsaved-dot'); }
  websiteError(): Locator { return this.page.getByTestId('partner-error-website'); }
  formBanner(): Locator { return this.page.getByTestId('partner-form-banner'); }
  visitLink(): Locator { return this.page.getByTestId('partner-visit-link'); }
}
