// traces_to: L2-054
import { Page, Locator } from '@playwright/test';

export class CalendarMonthPom {
  constructor(private readonly page: Page) {}

  calendar(): Locator { return this.page.getByTestId('calendar-month'); }
  todayCell(): Locator { return this.page.locator('.calendar-cell--today'); }
  dayCell(isoDate: string): Locator { return this.page.getByTestId(`calendar-cell-${isoDate}`); }
  prevButton(): Locator { return this.page.getByTestId('calendar-prev-month'); }
  nextButton(): Locator { return this.page.getByTestId('calendar-next-month'); }
  todayButton(): Locator { return this.page.getByTestId('calendar-today-button'); }
  monthLabel(): Locator { return this.page.getByTestId('calendar-month-label'); }
  moreButton(isoDate: string): Locator { return this.page.getByTestId(`calendar-more-${isoDate}`); }
  popover(): Locator { return this.page.getByTestId('calendar-popover'); }
}
