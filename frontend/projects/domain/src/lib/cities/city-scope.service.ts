// traces_to: L2-109
import { Injectable, computed, inject, signal } from '@angular/core';
import { PERMISSIONS_SERVICE } from '../rbac/permissions.contract';
import { ALL_CITIES, ICityScopeService } from './city-scope.service.contract';

@Injectable({ providedIn: 'root' })
export class CityScopeService implements ICityScopeService {
  private readonly perms = inject(PERMISSIONS_SERVICE);

  readonly active = signal<string>(ALL_CITIES);

  readonly current = computed(() => this.active());
  readonly isAllCities = computed(() => this.active() === ALL_CITIES);

  constructor() {
    const cityId = this.perms.snapshot().cityId;
    if (cityId) this.active.set(cityId);
  }

  set(cityId: string): void {
    this.active.set(cityId);
  }
}
