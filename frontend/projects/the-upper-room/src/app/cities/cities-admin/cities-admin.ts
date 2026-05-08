// traces_to: L2-077
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ConfirmService } from '../../../../../components/src/lib/confirm-dialog/confirm.service';
import { mapErrorToMessage } from '../../interceptors/error-catalog';

export interface CityRow {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly country: string;
  readonly archived: boolean;
  readonly members: number;
}

@Component({
  selector: 'app-cities-admin',
  templateUrl: './cities-admin.html',
  styleUrl: './cities-admin.scss',
})
export class CitiesAdmin implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly confirmer = inject(ConfirmService);

  protected readonly cities = signal<CityRow[]>([]);
  protected readonly creating = signal(false);
  protected readonly newName = signal('');
  protected readonly newCountry = signal('CA');
  protected readonly formError = signal<string | null>(null);

  protected readonly slugPreview = computed(() => slugify(this.newName()));

  ngOnInit(): void {
    this.refresh();
  }

  protected onNew(): void {
    this.formError.set(null);
    this.newName.set('');
    this.newCountry.set('CA');
    this.creating.set(true);
  }

  protected onSave(event: Event): void {
    event.preventDefault();
    this.formError.set(null);
    this.http
      .post<CityRow>('/api/v1/cities', { name: this.newName(), country: this.newCountry() })
      .subscribe({
        next: () => {
          this.creating.set(false);
          this.refresh();
        },
        error: (err: HttpErrorResponse) => {
          const code = (err.error as { code?: string } | null)?.code;
          if (code === 'validation.duplicate') {
            this.formError.set('A city with this name already exists in that country.');
          } else {
            this.formError.set(mapErrorToMessage(err.status, code));
          }
        },
      });
  }

  protected async onArchive(city: CityRow): Promise<void> {
    const ok = await this.confirmer.confirm({
      title: `Archive ${city.name}?`,
      body: `${city.members} members will lose this as their active city. They keep historical access.`,
      severity: 'warning',
      confirmLabel: 'Archive',
    });
    if (!ok) return;
    this.http.post(`/api/v1/cities/${city.slug}/archive`, {}).subscribe(() => this.refresh());
  }

  private refresh(): void {
    this.http
      .get<{ items: CityRow[] }>('/api/v1/cities')
      .subscribe((r) => this.cities.set(r.items));
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
