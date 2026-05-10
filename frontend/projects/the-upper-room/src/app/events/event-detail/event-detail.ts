// traces_to: L2-055
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from 'components';
import { PermissionsService } from 'domain';
import { EventAttendeesDialog, EventAttendeesDialogData } from './event-attendees-dialog';
import { EventCancelDialog } from './event-cancel-dialog';

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
  readonly requiresApproval: boolean;
  readonly recurrenceRule?: string | null;
  readonly recurrenceId?: string | null;
  readonly occurrenceDate?: string | null;
  readonly timezone?: string | null;
}

interface RsvpResponse {
  rsvpStatus: string;
  waitlistPosition?: number | null;
  promotedUser?: string | null;
}

interface PendingRsvpDto {
  id: string;
  userId: string;
  userName: string;
  requestedAt: string;
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
  private readonly snackbar = inject(SnackbarService);
  private readonly permissions = inject(PermissionsService);
  private readonly dialog = inject(MatDialog);

  protected readonly event = signal<EventDetailDto | null>(null);
  protected readonly myRsvpStatus = signal<string | null>(null);
  protected readonly myWaitlistPosition = signal<number | null>(null);
  protected readonly pendingRsvps = signal<PendingRsvpDto[]>([]);

  protected readonly visibleAttendees = computed(() =>
    (this.event()?.attendees ?? []).slice(0, MAX_VISIBLE_ATTENDEES)
  );

  protected readonly hiddenCount = computed(() =>
    Math.max(0, (this.event()?.attendees?.length ?? 0) - MAX_VISIBLE_ATTENDEES)
  );

  protected readonly isOrganizer = computed(() =>
    this.permissions.hasAnyRole(['CityLead', 'SystemAdmin'])
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.http.get<EventDetailDto>(`/api/v1/events/${id}`)
      .subscribe(e => this.event.set(e));
    this.http.get<{ rsvpStatus: string | null; waitlistPosition?: number | null }>(`/api/v1/events/${id}/rsvp`)
      .subscribe(r => {
        this.myRsvpStatus.set(r.rsvpStatus);
        this.myWaitlistPosition.set(r.waitlistPosition ?? null);
      });
    this.http.get<{ items: PendingRsvpDto[] }>(`/api/v1/events/${id}/rsvp/requests`)
      .subscribe(r => this.pendingRsvps.set(r.items));
  }

  protected rsvp(status: 'Yes' | 'Maybe' | 'No'): void {
    const id = this.event()?.id;
    if (!id) return;
    this.http.post<RsvpResponse>(`/api/v1/events/${id}/rsvp`, { status })
      .subscribe(r => {
        this.myRsvpStatus.set(r.rsvpStatus);
        this.myWaitlistPosition.set(r.waitlistPosition ?? null);
        if (r.rsvpStatus === 'Waitlisted') {
          this.snackbar.show(`You're on the waitlist (#${r.waitlistPosition})`, 'info');
        } else if (r.rsvpStatus === 'PendingApproval') {
          this.snackbar.show('RSVP submitted. The organizer will confirm shortly.', 'info');
        }
        if (r.promotedUser) {
          this.snackbar.show(`${r.promotedUser} moved off the waitlist`, 'info');
        }
      });
  }

  protected approvePendingRsvp(requestId: string): void {
    const id = this.event()?.id;
    if (!id) return;
    this.http.post(`/api/v1/events/${id}/rsvp/requests/${requestId}/approve`, {})
      .subscribe(() => {
        this.pendingRsvps.update(rs => rs.filter(r => r.id !== requestId));
        this.snackbar.show('RSVP approved.', 'success');
      });
  }

  protected denyPendingRsvp(requestId: string): void {
    const id = this.event()?.id;
    if (!id) return;
    this.http.post(`/api/v1/events/${id}/rsvp/requests/${requestId}/deny`, {})
      .subscribe(() => {
        this.pendingRsvps.update(rs => rs.filter(r => r.id !== requestId));
        this.snackbar.show('RSVP denied.', 'info');
      });
  }

  protected openAttendeesDialog(): void {
    const attendees = this.event()?.attendees ?? [];
    const data: EventAttendeesDialogData = { attendees };
    this.dialog.open<EventAttendeesDialog, EventAttendeesDialogData>(EventAttendeesDialog, { data });
  }

  protected openCancelDialog(): void {
    this.dialog
      .open<EventCancelDialog, void, string | null>(EventCancelDialog)
      .afterClosed()
      .subscribe((message) => {
        if (message === undefined) return;
        const id = this.event()?.id;
        if (!id) return;
        this.http.post<{ status: string }>(`/api/v1/events/${id}/cancel`, { message })
          .subscribe(r => {
            this.event.update(ev => ev ? { ...ev, status: r.status } : ev);
          });
      });
  }

  protected addToCalendar(): void {
    const ev = this.event();
    if (!ev) return;
    const slug = (ev.title ?? 'event')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const a = document.createElement('a');
    a.href = `/api/v1/events/${ev.id}/ics`;
    a.download = `${slug || 'event'}.ics`;
    a.click();
  }

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
