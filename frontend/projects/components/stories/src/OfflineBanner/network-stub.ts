import { signal } from '@angular/core';
import type { Provider } from '@angular/core';

import { NetworkService, type BannerState } from 'components';

/**
 * A controllable stand-in for `NetworkService`: the real service follows the
 * browser's `online` / `offline` events, which a story can't trigger, so this
 * stub exposes the same `bannerState` signal and `dismiss()` with a setter.
 */
export class NetworkServiceStub {
  readonly bannerState = signal<BannerState>(null);

  constructor(initial: BannerState) {
    this.bannerState.set(initial);
  }

  dismiss(): void {
    this.bannerState.set(null);
  }
}

export function provideNetworkStub(stub: NetworkServiceStub): Provider {
  return { provide: NetworkService, useValue: stub };
}
