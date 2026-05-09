// traces_to: L2-056
import { Page, Locator } from '@playwright/test';

export class EventFormPage {
  constructor(private readonly page: Page) {}

  async gotoNew(): Promise<void> { await this.page.goto('/events/new'); }
  async gotoEdit(id: string): Promise<void> { await this.page.goto(`/events/${id}/edit`); }

  titleInput(): Locator { return this.page.getByTestId('event-form-title'); }
  descriptionInput(): Locator { return this.page.getByTestId('event-form-description'); }
  startInput(): Locator { return this.page.getByTestId('event-form-start'); }
  endInput(): Locator { return this.page.getByTestId('event-form-end'); }
  timezoneSelect(): Locator { return this.page.getByTestId('event-form-timezone'); }
  endError(): Locator { return this.page.getByTestId('event-form-end-error'); }
  locationSearch(): Locator { return this.page.getByTestId('event-form-location-search'); }
  locationResult(id: string): Locator { return this.page.getByTestId(`event-form-location-result-${id}`); }
  capacityInput(): Locator { return this.page.getByTestId('event-form-capacity'); }
  submitButton(): Locator { return this.page.getByTestId('event-form-submit'); }
  previewCard(): Locator { return this.page.getByTestId('event-form-preview'); }
  previewTitle(): Locator { return this.page.getByTestId('event-preview-title'); }
  previewLocation(): Locator { return this.page.getByTestId('event-preview-location'); }
  previewStartTime(): Locator { return this.page.getByTestId('event-preview-start-time'); }
  previewTimezoneLabel(): Locator { return this.page.getByTestId('event-preview-timezone-label'); }
}
