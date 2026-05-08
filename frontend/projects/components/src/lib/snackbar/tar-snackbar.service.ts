// traces_to: L2-061
import { Injectable, signal } from '@angular/core';

export type SnackbarSeverity = 'info' | 'success' | 'warning' | 'error';

export interface SnackbarAction {
  readonly label: string;
  readonly onClick: () => void;
}

export interface SnackbarItem {
  readonly message: string;
  readonly severity: SnackbarSeverity;
  readonly action?: SnackbarAction;
}

const DURATION_MS: Record<SnackbarSeverity, number> = {
  info: 4000,
  success: 5000,
  warning: 7000,
  error: 0,
};

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  readonly current = signal<SnackbarItem | null>(null);

  private readonly queue: SnackbarItem[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private remaining = 0;
  private startedAt = 0;

  show(message: string, severity: SnackbarSeverity = 'info', action?: SnackbarAction): void {
    this.queue.push({ message, severity, action });
    if (!this.current()) this.advance();
  }

  dismiss(): void {
    this.clearTimer();
    this.advance();
  }

  pause(): void {
    if (this.timer === null) return;
    clearTimeout(this.timer);
    this.timer = null;
    this.remaining -= Date.now() - this.startedAt;
  }

  resume(): void {
    if (this.timer !== null || this.remaining <= 0) return;
    this.startedAt = Date.now();
    this.timer = setTimeout(() => this.dismiss(), this.remaining);
  }

  private advance(): void {
    const next = this.queue.shift() ?? null;
    this.current.set(next);
    if (!next) return;
    const duration = DURATION_MS[next.severity];
    if (duration > 0) {
      this.remaining = duration;
      this.startedAt = Date.now();
      this.timer = setTimeout(() => this.dismiss(), duration);
    }
  }

  private clearTimer(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
    this.remaining = 0;
  }
}
