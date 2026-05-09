import { InjectionToken, WritableSignal } from '@angular/core';

export type IdleState = 'active' | 'warning';

export interface IIdleService {
  readonly state: WritableSignal<IdleState>;
  readonly countdown: WritableSignal<number>;

  staySignedIn(): void;
}

export const IDLE_SERVICE = new InjectionToken<IIdleService>('IDLE_SERVICE');
