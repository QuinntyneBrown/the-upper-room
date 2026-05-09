// traces_to: L2-058, L2-113
import { Page, Locator } from '@playwright/test';

export class LocationDetailPage {
  constructor(private readonly page: Page) {}

  async goto(id: string): Promise<void> { await this.page.goto(`/locations/${id}`); }

  mapImage(): Locator { return this.page.getByTestId('location-map-image'); }
  mapPlaceholder(): Locator { return this.page.getByTestId('location-map-placeholder'); }
  carouselImage(): Locator { return this.page.getByTestId('location-carousel-image'); }
  carouselNext(): Locator { return this.page.getByTestId('location-carousel-next'); }
  carouselPrev(): Locator { return this.page.getByTestId('location-carousel-prev'); }
  photoInput(): Locator { return this.page.getByTestId('location-photo-input'); }
  eventsLink(): Locator { return this.page.getByTestId('location-events-link'); }
}
