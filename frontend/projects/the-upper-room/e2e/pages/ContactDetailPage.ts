// traces_to: L2-031
import { Page, Locator } from '@playwright/test';

export class ContactDetailPage {
  constructor(private readonly page: Page) {}

  async goto(id: string): Promise<void> { await this.page.goto(`/contacts/${id}`); }
  header(): Locator { return this.page.getByTestId('contact-detail-header'); }
  avatar(): Locator { return this.page.getByTestId('avatar-initials'); }
  editButton(): Locator { return this.page.getByTestId('contact-edit-button'); }
  archiveButton(): Locator { return this.page.getByTestId('contact-archive-button'); }
  phones(): Locator { return this.page.getByTestId('contact-detail-phones'); }
  emails(): Locator { return this.page.getByTestId('contact-detail-emails'); }
  tags(): Locator { return this.page.getByTestId('contact-detail-tags'); }
  linkedPartners(): Locator { return this.page.getByTestId('contact-detail-partners'); }
  tab(name: string): Locator { return this.page.getByTestId(`contact-tab-${name.toLowerCase()}`); }
  overviewPanel(): Locator { return this.page.getByTestId('contact-panel-overview'); }
}
