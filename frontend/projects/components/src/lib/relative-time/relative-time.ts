// traces_to: L2-110
import {
  Component, OnInit, OnDestroy, inject, signal, computed, input, LOCALE_ID,
} from '@angular/core';
import { formatDate } from '@angular/common';
import { NgZone } from '@angular/core';

@Component({
  selector: 'tar-relative-time',
  templateUrl: './relative-time.html',
})
export class TarRelativeTime implements OnInit, OnDestroy {
  readonly timestamp = input.required<Date | string>();

  private readonly zone = inject(NgZone);
  private readonly localeId = inject(LOCALE_ID);
  private readonly tick = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;

  protected readonly text = computed(() => {
    this.tick();
    return this.format(this.timestamp());
  });

  ngOnInit(): void {
    this.timer = this.zone.runOutsideAngular(() =>
      setInterval(() => this.zone.run(() => this.tick.update((v) => v + 1)), 60_000),
    );
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private format(ts: Date | string): string {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days <= 7) return `${days}d ago`;
    return formatDate(new Date(ts), 'MMM d, y', this.localeId);
  }
}
