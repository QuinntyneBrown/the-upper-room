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

  viewTab(name: 'month' | 'week' | 'day' | 'agenda'): Locator { return this.page.getByTestId(`calendar-view-tab-${name}`); }
  weekView(): Locator { return this.page.getByTestId('calendar-week-view'); }
  dayView(): Locator { return this.page.getByTestId('calendar-day-view'); }
  agendaView(): Locator { return this.page.getByTestId('calendar-agenda-view'); }
  hourRow(time: string): Locator { return this.page.getByTestId(`calendar-hour-row-${time}`); }
  weekColumn(index: number): Locator { return this.page.getByTestId(`calendar-week-col-${index}`); }
  daySlot(time: string): Locator { return this.page.getByTestId(`calendar-day-slot-${time}`); }
  agendaDateHeader(isoDate: string): Locator { return this.page.getByTestId(`calendar-agenda-date-${isoDate}`); }
  agendaEvent(id: string): Locator { return this.page.getByTestId(`agenda-event-${id}`); }
}
