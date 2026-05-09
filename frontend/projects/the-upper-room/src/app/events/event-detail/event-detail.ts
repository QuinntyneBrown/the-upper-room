// traces_to: L2-055
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

export interface AttendeeDto {
  readonly id: string;
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly rsvpStatus: string;
}

export interface EventDetailDto {
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
  readonly description: string | null;
  readonly attendees: AttendeeDto[];
}

const MAX_VISIBLE_ATTENDEES = 5;

@Component({
  selector: 'app-event-detail',
  imports: [],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss',
})
export class EventDetail implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  protected readonly event = signal<EventDetailDto | null>(null);
  protected readonly showAttendeesDialog = signal(false);

  protected readonly visibleAttendees = computed(() =>
    (this.event()?.attendees ?? []).slice(0, MAX_VISIBLE_ATTENDEES)
  );

  protected readonly hiddenCount = computed(() =>
    Math.max(0, (this.event()?.attendees?.length ?? 0) - MAX_VISIBLE_ATTENDEES)
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.http.get<EventDetailDto>(`/api/v1/events/${id}`)
      .subscribe(e => this.event.set(e));
  }

  protected openAttendeesDialog(): void { this.showAttendeesDialog.set(true); }
  protected closeAttendeesDialog(): void { this.showAttendeesDialog.set(false); }

  protected addToCalendar(): void { /* TASK-0126 */ }

  protected copyShareUrl(): void { /* TASK-0176 */ }

  protected formatDate(iso: string): string {
    try {
      return new Intl.DateTimeFormat(undefined, {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
      }).format(new Date(iso));
    } catch { return iso; }
  }

  protected initials(name: string): string {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }
}
