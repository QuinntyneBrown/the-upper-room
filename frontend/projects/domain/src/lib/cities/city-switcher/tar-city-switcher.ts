// traces_to: L2-109
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TarBanner } from 'components';
import { PERMISSIONS_SERVICE } from '../../rbac/permissions.contract';
import { ALL_CITIES, CityScopeService } from '../city-scope.service';

interface CityRow {
  id: string;
  name: string;
  slug: string;
  archived: boolean;
}

@Component({
  selector: 'tar-city-switcher',
  imports: [TarBanner],
  templateUrl: './tar-city-switcher.html',
  styleUrl: './tar-city-switcher.scss',
})
export class TarCitySwitcher implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly perms = inject(PERMISSIONS_SERVICE);
  protected readonly scope = inject(CityScopeService);

  protected readonly canSwitch = computed(() => this.perms.hasPermission('City:Switch'));
  protected readonly cities = signal<CityRow[]>([]);
  protected readonly visibleCities = computed(() => this.cities().filter((c) => !c.archived));
  protected readonly open = signal(false);

  protected readonly currentLabel = computed(() => {
    if (this.scope.isAllCities()) return 'All cities';
    const slug = this.scope.current();
    return this.cities().find((c) => c.slug === slug)?.name ?? slug;
  });

  protected readonly allCitiesValue = ALL_CITIES;

  ngOnInit(): void {
    if (!this.canSwitch()) return;
    this.http
      .get<{ items: CityRow[] }>('/api/v1/cities')
      .subscribe((r) => this.cities.set(r.items));
  }

  protected toggle(): void {
    this.open.update((v) => !v);
  }

  protected select(slug: string): void {
    this.scope.set(slug);
    this.open.set(false);
  }
}
