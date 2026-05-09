// traces_to: L2-056
import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import type { EventDetailDto } from '../event-detail/event-detail';

interface LocationRef { id: string; name: string; }

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'America/Toronto', 'America/Vancouver',
  'Europe/London', 'Europe/Paris', 'Asia/Tokyo',
];

function formatInTZ(localIso: string, tz: string): string {
  if (!localIso) return '';
  try {
    const date = new Date(localIso + ':00Z');
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
      timeZone: tz, timeZoneName: 'short',
    }).format(date);
  } catch { return localIso; }
}

@Component({
  selector: 'app-event-form',
  imports: [],
  templateUrl: './event-form.html',
  styleUrl: './event-form.scss',
})
export class EventForm implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly eventId = signal<string | null>(null);
  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly startAt = signal('');
  protected readonly endAt = signal('');
  protected readonly timezone = signal('UTC');
  protected readonly allDay = signal(false);
  protected readonly locationId = signal<string | null>(null);
  protected readonly locationName = signal('');
  protected readonly locationQuery = signal('');
  protected readonly locationResults = signal<LocationRef[]>([]);
  protected readonly showLocationResults = signal(false);
  protected readonly isVirtual = signal(false);
  protected readonly virtualUrl = signal('');
  protected readonly capacity = signal('');
  protected readonly requiresApproval = signal(false);
  protected readonly tagInput = signal('');
  protected readonly tags = signal<string[]>([]);
  protected readonly recurrenceType = signal<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  protected readonly recurrenceEditScope = signal<'single' | 'following' | 'series' | null>(null);
  protected readonly showRecurrenceDialog = signal(false);
  protected readonly isRecurring = signal(false);

  protected readonly timezones = TIMEZONES;

  protected readonly endBeforeStart = computed(() => {
    if (!this.startAt() || !this.endAt()) return false;
    return new Date(this.endAt() + ':00Z') <= new Date(this.startAt() + ':00Z');
  });

  protected readonly canSubmit = computed(() =>
    !this.endBeforeStart() && !!this.title().trim()
  );

  protected readonly previewStartTime = computed(() => formatInTZ(this.startAt(), this.timezone()));
  protected readonly previewEndTime = computed(() => formatInTZ(this.endAt(), this.timezone()));

  private locationTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventId.set(id);
      this.http.get<EventDetailDto>(`/api/v1/events/${id}`)
        .subscribe(ev => {
          this.populateForm(ev);
          if (ev.recurrenceId) {
            this.isRecurring.set(true);
            this.showRecurrenceDialog.set(true);
          }
        });
    }
    const qp = this.route.snapshot.queryParamMap;
    const start = qp.get('start');
    const end = qp.get('end');
    if (start) this.startAt.set(start.slice(0, 16));
    if (end) this.endAt.set(end.slice(0, 16));
  }

  ngOnDestroy(): void {
    if (this.locationTimer) clearTimeout(this.locationTimer);
  }

  private populateForm(ev: EventDetailDto): void {
    this.title.set(ev.title);
    this.description.set(ev.description ?? '');
    this.startAt.set(ev.startAt.slice(0, 16));
    this.endAt.set(ev.endAt.slice(0, 16));
    if (ev.location) {
      this.locationName.set(ev.location);
      this.locationQuery.set(ev.location);
    }
    this.isVirtual.set(ev.isVirtual);
    if (ev.capacity) this.capacity.set(String(ev.capacity));
    this.tags.set([...(ev.tags ?? [])]);
    if (ev.recurrenceRule) {
      const freq = ev.recurrenceRule.match(/FREQ=(\w+)/)?.[1]?.toLowerCase();
      if (freq === 'daily' || freq === 'weekly' || freq === 'monthly') {
        this.recurrenceType.set(freq);
      }
    }
  }

  protected chooseEditScope(scope: 'single' | 'following' | 'series'): void {
    this.recurrenceEditScope.set(scope);
    this.showRecurrenceDialog.set(false);
  }

  protected onLocationInput(v: string): void {
    this.locationQuery.set(v);
    this.locationId.set(null);
    this.locationName.set('');
    if (this.locationTimer) clearTimeout(this.locationTimer);
    if (v.trim()) {
      this.locationTimer = setTimeout(() => {
        this.http.get<{ items: LocationRef[] }>(`/api/v1/locations?search=${encodeURIComponent(v)}`)
          .subscribe(r => {
            this.locationResults.set(r.items);
            this.showLocationResults.set(r.items.length > 0);
          });
      }, 250);
    } else {
      this.locationResults.set([]);
      this.showLocationResults.set(false);
    }
  }

  protected selectLocation(loc: LocationRef): void {
    this.locationId.set(loc.id);
    this.locationName.set(loc.name);
    this.locationQuery.set(loc.name);
    this.locationResults.set([]);
    this.showLocationResults.set(false);
  }

  protected addTag(): void {
    const tag = this.tagInput().trim();
    if (tag && !this.tags().includes(tag)) {
      this.tags.update(ts => [...ts, tag]);
    }
    this.tagInput.set('');
  }

  protected removeTag(tag: string): void {
    this.tags.update(ts => ts.filter(t => t !== tag));
  }

  protected onTagKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') { e.preventDefault(); this.addTag(); }
  }

  protected onSubmit(): void {
    if (!this.canSubmit()) return;
    const body = {
      title: this.title(),
      description: this.description() || null,
      startAt: this.startAt() ? new Date(this.startAt() + ':00Z').toISOString() : null,
      endAt: this.endAt() ? new Date(this.endAt() + ':00Z').toISOString() : null,
      timezone: this.timezone(),
      locationId: this.locationId(),
      location: this.locationName() || null,
      isVirtual: this.isVirtual(),
      virtualUrl: this.virtualUrl() || null,
      capacity: this.capacity() ? parseInt(this.capacity()) : null,
      requiresApproval: this.requiresApproval(),
      tags: this.tags(),
    };
    const id = this.eventId();
    const req = id
      ? this.http.put<EventDetailDto>(`/api/v1/events/${id}`, body)
      : this.http.post<EventDetailDto>('/api/v1/events', body);
    req.subscribe(ev => void this.router.navigate(['/events', ev.id, 'edit']));
  }
}
