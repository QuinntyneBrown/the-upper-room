// traces_to: L2-055
import { Page, Locator } from '@playwright/test';

export class EventDetailPage {
  constructor(private readonly page: Page) {}

  async goto(id: string): Promise<void> { await this.page.goto(`/events/${id}`); }

  title(): Locator { return this.page.getByTestId('event-detail-title'); }
  statusChip(): Locator { return this.page.getByTestId('event-status-chip'); }
  shareButton(): Locator { return this.page.getByTestId('event-share-button'); }
  addToCalendarButton(): Locator { return this.page.getByTestId('event-add-to-calendar'); }
  attendeesGrid(): Locator { return this.page.getByTestId('event-attendees-grid'); }
  attendeeAvatar(id: string): Locator { return this.page.getByTestId(`attendee-avatar-${id}`); }
  attendeesMoreButton(): Locator { return this.page.getByTestId('event-attendees-more'); }
  attendeesDialog(): Locator { return this.page.getByTestId('event-attendees-dialog'); }
  attendeeListItem(id: string): Locator { return this.page.getByTestId(`attendee-list-${id}`); }
  datetimeCard(): Locator { return this.page.getByTestId('event-datetime-card'); }
  rsvpCard(): Locator { return this.page.getByTestId('event-rsvp-card'); }
}
