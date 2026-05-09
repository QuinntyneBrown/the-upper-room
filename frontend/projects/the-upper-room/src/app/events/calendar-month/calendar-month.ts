// traces_to: L2-054
import { Component, Input, OnChanges, Output, EventEmitter, SimpleChanges, signal, computed } from '@angular/core';
import type { EventDto } from '../event-list/event-list';

interface CalendarDay {
  date: Date;
  dateStr: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  events: EventDto[];
  visible: EventDto[];
  overflow: number;
}

@Component({
  selector: 'app-calendar-month',
  imports: [],
  templateUrl: './calendar-month.html',
  styleUrl: './calendar-month.scss',
})
export class CalendarMonth implements OnChanges {
  @Input() events: EventDto[] = [];
  @Output() monthChange = new EventEmitter<{ year: number; month: number }>();

  protected readonly viewDate = signal(new Date());
  protected readonly selectedDate = signal<string | null>(null);
  protected readonly popoverDay = signal<CalendarDay | null>(null);

  private readonly _today = toIsoDate(new Date());

  protected readonly monthLabel = computed(() =>
    new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(this.viewDate())
  );

  protected readonly days = computed<CalendarDay[]>(() => {
    const vd = this.viewDate();
    const year = vd.getFullYear();
    const month = vd.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const totalCells = Math.ceil((startOffset + daysInMonth(year, month)) / 7) * 7;

    return Array.from({ length: totalCells }, (_, i) => {
      const date = new Date(year, month, 1 - startOffset + i);
      const dateStr = toIsoDate(date);
      const dayEvents = this.events.filter((e) => e.startAt.startsWith(dateStr));
      return {
        date,
        dateStr,
        isToday: dateStr === this._today,
        isCurrentMonth: date.getMonth() === month,
        events: dayEvents,
        visible: dayEvents.slice(0, 3),
        overflow: Math.max(0, dayEvents.length - 3),
      };
    });
  });

  protected readonly weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  ngOnChanges(_: SimpleChanges): void {
    this.popoverDay.set(null);
  }

  protected prevMonth(): void {
    this.viewDate.update((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    this.popoverDay.set(null);
    this.emitMonthChange();
  }

  protected nextMonth(): void {
    this.viewDate.update((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    this.popoverDay.set(null);
    this.emitMonthChange();
  }

  protected goToToday(): void {
    this.viewDate.set(new Date());
    this.selectedDate.set(this._today);
    this.popoverDay.set(null);
    this.emitMonthChange();
  }

  private emitMonthChange(): void {
    const d = this.viewDate();
    this.monthChange.emit({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }

  protected selectDay(day: CalendarDay): void {
    this.selectedDate.set(day.dateStr);
    this.popoverDay.set(null);
  }

  protected openPopover(day: CalendarDay, event: MouseEvent): void {
    event.stopPropagation();
    this.popoverDay.set(day);
  }

  protected closePopover(): void {
    this.popoverDay.set(null);
  }

  protected viewYear(): number { return this.viewDate().getFullYear(); }
  protected viewMonth(): number { return this.viewDate().getMonth(); }
}

function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}
