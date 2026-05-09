import { InjectionToken, Signal, WritableSignal } from '@angular/core';

export const ALL_CITIES = '__all__';

export interface ICityScopeService {
  readonly active: WritableSignal<string>;
  readonly current: Signal<string>;
  readonly isAllCities: Signal<boolean>;

  set(cityId: string): void;
}

export const CITY_SCOPE_SERVICE = new InjectionToken<ICityScopeService>('CITY_SCOPE_SERVICE');
