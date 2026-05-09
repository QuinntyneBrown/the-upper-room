// traces_to: L2-054
import { Component, Input, OnChanges, Output, EventEmitter, SimpleChanges, signal, computed, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import type { EventDto } from '../event-list/event-list';

type ViewType = 'month' | 'week' | 'day' | 'agenda';

interface CalendarDay {
  date: Date;
  dateStr: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  events: EventDto[];
  visible: EventDto[];
  overflow: number;
}

interface AgendaGroup {
  dateStr: string;
  label: string;
  events: EventDto[];
}

const STORAGE_KEY = 'calendar-view-type';
const HOURS = Array.from({ length: 18 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`);

@Component({
  selector: 'app-calendar-month',
  imports: [],
  templateUrl: './calendar-month.html',
  styleUrl: './calendar-month.scss',
})
export class CalendarMonth implements OnChanges {
  @Input() events: EventDto[] = [];
  @Output() monthChange = new EventEmitter<{ year: number; month: number }>();

  private readonly router = inject(Router);

  protected readonly viewDate = signal(new Date());
  protected readonly selectedDate = signal<string | null>(null);
  protected readonly popoverDay = signal<CalendarDay | null>(null);
  protected readonly viewType = signal<ViewType>(
    (localStorage.getItem(STORAGE_KEY) as ViewType | null) ?? 'month'
  );

  protected readonly dragStartHour = signal<string | null>(null);
  protected readonly dragEndHour = signal<string | null>(null);
  protected readonly isDragging = signal(false);

  protected readonly viewTypes: ViewType[] = ['month', 'week', 'day', 'agenda'];
  protected readonly hours = HOURS;
  private readonly _today = toIsoDate(new Date());

  constructor() {
    effect(() => { localStorage.setItem(STORAGE_KEY, this.viewType()); });
  }

  protected readonly periodLabel = computed(() => {
    const vd = this.viewDate();
    switch (this.viewType()) {
      case 'month':
        return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(vd);
      case 'week': {
        const sun = weekStart(vd);
        const sat = new Date(sun);
        sat.setDate(sun.getDate() + 6);
        return `${sun.toLocaleDateString('en', { month: 'short', day: 'numeric' })} – ${sat.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
      case 'day':
        return vd.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      case 'agenda':
        return 'Upcoming Events';
    }
  });

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

  protected readonly weekDates = computed<Date[]>(() => {
    const sun = weekStart(this.viewDate());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sun);
      d.setDate(sun.getDate() + i);
      return d;
    });
  });

  protected readonly weekEventsGrid = computed(() => {
    const dates = this.weekDates();
    return this.hours.map(hour => ({
      hour,
      slots: dates.map(date => {
        const dateStr = toIsoDate(date);
        const h = hour.slice(0, 2);
        return this.events.filter(e => e.startAt.startsWith(dateStr) && e.startAt.includes(`T${h}`));
      }),
    }));
  });

  protected readonly dayEvents = computed(() => {
    const dateStr = toIsoDate(this.viewDate());
    return this.events.filter(e => e.startAt.startsWith(dateStr));
  });

  protected readonly agendaItems = computed<AgendaGroup[]>(() => {
    const sorted = [...this.events].sort((a, b) => a.startAt.localeCompare(b.startAt));
    const groups: AgendaGroup[] = [];
    for (const ev of sorted) {
      const dateStr = ev.startAt.slice(0, 10);
      let group = groups.find(g => g.dateStr === dateStr);
      if (!group) {
        const d = new Date(ev.startAt);
        group = {
          dateStr,
          label: d.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          events: [],
        };
        groups.push(group);
      }
      group.events.push(ev);
    }
    return groups;
  });

  protected readonly weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  ngOnChanges(_: SimpleChanges): void {
    this.popoverDay.set(null);
  }

  protected setViewType(vt: ViewType): void {
    this.viewType.set(vt);
    this.popoverDay.set(null);
  }

  protected prev(): void {
    const vt = this.viewType();
    this.viewDate.update(d => {
      const nd = new Date(d);
      if (vt === 'month') nd.setMonth(nd.getMonth() - 1);
      else if (vt === 'week') nd.setDate(nd.getDate() - 7);
      else if (vt === 'day') nd.setDate(nd.getDate() - 1);
      return nd;
    });
    this.popoverDay.set(null);
    this.emitMonthChange();
  }

  protected next(): void {
    const vt = this.viewType();
    this.viewDate.update(d => {
      const nd = new Date(d);
      if (vt === 'month') nd.setMonth(nd.getMonth() + 1);
      else if (vt === 'week') nd.setDate(nd.getDate() + 7);
      else if (vt === 'day') nd.setDate(nd.getDate() + 1);
      return nd;
    });
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

  protected startDrag(hour: string): void {
    this.isDragging.set(true);
    this.dragStartHour.set(hour);
    this.dragEndHour.set(hour);
  }

  protected onDragOver(hour: string): void {
    if (this.isDragging()) this.dragEndHour.set(hour);
  }

  protected endDrag(): void {
    if (!this.isDragging()) return;
    this.isDragging.set(false);
    const start = this.dragStartHour();
    const end = this.dragEndHour();
    if (start && end) {
      const dateStr = toIsoDate(this.viewDate());
      const [s, e] = start <= end ? [start, end] : [end, start];
      const endH = parseInt(e.split(':')[0]) + 1;
      const endTime = `${String(endH).padStart(2, '0')}:00`;
      void this.router.navigate(['/events/new'], {
        queryParams: { start: `${dateStr}T${s}`, end: `${dateStr}T${endTime}` },
      });
    }
  }

  protected isInDragRange(hour: string): boolean {
    const s = this.dragStartHour();
    const e = this.dragEndHour();
    if (!s || !e) return false;
    const [lo, hi] = s <= e ? [s, e] : [e, s];
    return hour >= lo && hour <= hi;
  }

  protected viewYear(): number { return this.viewDate().getFullYear(); }
  protected viewMonth(): number { return this.viewDate().getMonth(); }

  protected capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

  protected isoDate(d: Date): string { return toIsoDate(d); }
}

function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function weekStart(d: Date): Date {
  const sun = new Date(d);
  sun.setDate(d.getDate() - d.getDay());
  return sun;
}
