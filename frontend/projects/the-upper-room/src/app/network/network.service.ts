// traces_to: L2-070
import { Injectable, computed, signal } from '@angular/core';

export type BannerState = 'offline' | 'online' | null;

@Injectable({ providedIn: 'root' })
export class NetworkService {
  private readonly offline = signal(typeof navigator !== 'undefined' && !navigator.onLine);
  private readonly justRecovered = signal(false);
  private readonly dismissed = signal(false);

  readonly bannerState = computed<BannerState>(() => {
    if (this.dismissed()) return null;
    if (this.offline()) return 'offline';
    if (this.justRecovered()) return 'online';
    return null;
  });

  constructor() {
    if (typeof window === 'undefined') return;
    window.addEventListener('offline', () => {
      this.offline.set(true);
      this.dismissed.set(false);
    });
    window.addEventListener('online', () => {
      this.offline.set(false);
      this.dismissed.set(false);
      this.justRecovered.set(true);
      setTimeout(() => this.justRecovered.set(false), 3000);
    });
  }

  dismiss(): void {
    this.dismissed.set(true);
  }
}
