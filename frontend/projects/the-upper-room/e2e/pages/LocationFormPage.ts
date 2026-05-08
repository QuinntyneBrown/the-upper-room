// traces_to: L2-057, L2-058
import { Page, Locator } from '@playwright/test';

export class LocationFormPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> { await this.page.goto('/locations/new'); }

  nameInput(): Locator { return this.page.getByTestId('location-name'); }
  streetInput(): Locator { return this.page.getByTestId('location-street'); }
  cityInput(): Locator { return this.page.getByTestId('location-city'); }
  stateInput(): Locator { return this.page.getByTestId('location-state'); }
  countryInput(): Locator { return this.page.getByTestId('location-country'); }
  postalCodeInput(): Locator { return this.page.getByTestId('location-postal-code'); }
  capacityInput(): Locator { return this.page.getByTestId('location-capacity'); }
  capacityError(): Locator { return this.page.getByTestId('location-capacity-error'); }
  submitButton(): Locator { return this.page.getByTestId('location-submit'); }
  cancelButton(): Locator { return this.page.getByTestId('location-cancel'); }
}
