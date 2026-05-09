// traces_to: L2-052, L2-053
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TarEmptyState } from '../../../../../components/src/lib/states/tar-empty-state';
import { CalendarMonth } from '../calendar-month/calendar-month';

export interface EventDto {
  readonly id: string;
  readonly title: string;
  readonly coverImageUrl: string | null;
  readonly status: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly location: string | null;
  readonly isVirtual: boolean;
  readonly rsvpCount: number;
  readonly capacity: number | null;
  readonly tags: string[];
  readonly recurrenceRule?: string | null;
  readonly recurrenceId?: string | null;
  readonly occurrenceDate?: string | null;
}

@Component({
  selector: 'app-event-list',
  imports: [TarEmptyState, CalendarMonth],
  templateUrl: './event-list.html',
  styleUrl: './event-list.scss',
})
export class EventList implements OnInit {
  private readonly http = inject(HttpClient);

  protected readonly events = signal<EventDto[]>([]);
  protected readonly statusFilter = signal('');
  protected readonly viewMode = signal<'list' | 'calendar'>('list');
  protected readonly calendarMonth = signal(new Date());

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    const params = new URLSearchParams();
    if (this.statusFilter()) params.set('status', this.statusFilter());
    if (this.viewMode() === 'calendar') {
      const d = this.calendarMonth();
      params.set('month', `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    const qs = params.toString();
    this.http
      .get<{ items: EventDto[] }>(`/api/v1/events${qs ? `?${qs}` : ''}`)
      .subscribe((r) => this.events.set(r.items));
  }

  protected onStatusFilter(value: string): void {
    this.statusFilter.set(value);
    this.load();
  }

  protected toggleView(): void {
    this.viewMode.update((v) => (v === 'list' ? 'calendar' : 'list'));
    this.load();
  }

  protected onCalendarMonthChange(e: { year: number; month: number }): void {
    this.calendarMonth.set(new Date(e.year, e.month - 1, 1));
    this.load();
  }

  protected formatDate(iso: string): string {
    try {
      return new Intl.DateTimeFormat(undefined, {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
      }).format(new Date(iso));
    } catch { return iso; }
  }
}
