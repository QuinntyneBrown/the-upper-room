// traces_to: L2-022
import { Injectable, inject, signal } from '@angular/core';
import { ACCESS_TOKEN_SOURCE } from '../services/access-token.contract';
import { SignOutService } from './sign-out.service';

const IDLE_THRESHOLD_MS = 30 * 60 * 1000;
const COUNTDOWN_SECONDS = 60;

type State = 'active' | 'warning';

@Injectable({ providedIn: 'root' })
export class IdleService {
  private readonly tokenSource = inject(ACCESS_TOKEN_SOURCE);
  private readonly signOutService = inject(SignOutService);

  readonly state = signal<State>('active');
  readonly countdown = signal(COUNTDOWN_SECONDS);

  private lastActivity = Date.now();
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window === 'undefined') return;
    for (const evt of ['mousemove', 'keydown', 'pointerdown', 'focus'] as const) {
      window.addEventListener(evt, () => this.markActive(), { passive: true });
    }
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  staySignedIn(): void {
    this.markActive();
  }

  private markActive(): void {
    this.lastActivity = Date.now();
    if (this.state() === 'warning') {
      this.state.set('active');
      this.countdown.set(COUNTDOWN_SECONDS);
    }
  }

  private tick(): void {
    if (!this.tokenSource.current()) return;
    const elapsed = Date.now() - this.lastActivity;
    if (this.state() === 'active') {
      if (elapsed >= IDLE_THRESHOLD_MS) {
        this.state.set('warning');
        this.countdown.set(COUNTDOWN_SECONDS);
      }
      return;
    }
    const remaining = COUNTDOWN_SECONDS - Math.floor((elapsed - IDLE_THRESHOLD_MS) / 1000);
    this.countdown.set(Math.max(0, remaining));
    if (remaining <= 0) {
      this.state.set('active');
      this.countdown.set(COUNTDOWN_SECONDS);
      this.signOutService.forceSignOut();
    }
  }
}
