// traces_to: L2-036
import { Page, Locator } from '@playwright/test';

export class PartnerDetailPage {
  constructor(private readonly page: Page) {}

  async goto(id: string): Promise<void> { await this.page.goto(`/partners/${id}`); }
  header(): Locator { return this.page.getByTestId('partner-detail-header'); }
  name(): Locator { return this.page.getByTestId('partner-detail-name'); }
  websiteLink(): Locator { return this.page.getByTestId('partner-website-link'); }
  letterAvatar(): Locator { return this.page.getByTestId('partner-letter-avatar'); }
  logoImg(): Locator { return this.page.getByTestId('partner-logo'); }
  tab(name: string): Locator { return this.page.getByTestId(`partner-tab-${name.toLowerCase()}`); }
  overviewPanel(): Locator { return this.page.getByTestId('partner-panel-overview'); }
  description(): Locator { return this.page.getByTestId('partner-description'); }
}
