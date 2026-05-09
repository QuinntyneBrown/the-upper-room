// traces_to: L2-057, L2-058
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { SnackbarService } from '../../../../../components/src/lib/snackbar/tar-snackbar.service';
import { TarEmptyState } from '../../../../../components/src/lib/states/tar-empty-state';

export interface LocationDto {
  readonly id: string;
  readonly name: string;
  readonly street: string;
  readonly city: string;
  readonly state: string;
  readonly country: string;
  readonly postalCode: string;
  readonly capacity: number | null;
  readonly lat: number | null;
  readonly lng: number | null;
  readonly archived: boolean;
}

@Component({
  selector: 'app-location-list',
  imports: [TarEmptyState],
  templateUrl: './location-list.html',
  styleUrl: './location-list.scss',
})
export class LocationList implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly snackbar = inject(SnackbarService);

  protected readonly locations = signal<LocationDto[]>([]);

  ngOnInit(): void {
    this.http
      .get<{ items: LocationDto[] }>('/api/v1/locations')
      .subscribe((r) => this.locations.set(r.items));
  }

  protected goToNew(): void {
    this.router.navigateByUrl('/locations/new');
  }

  protected deleteLocation(loc: LocationDto): void {
    this.http.delete(`/api/v1/locations/${loc.id}`).subscribe({
      next: () => {
        this.locations.update((items) => items.filter((l) => l.id !== loc.id));
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.snackbar.show('Location is used by upcoming events.', 'warning', {
            label: 'Archive instead',
            onClick: () => this.archiveLocation(loc.id),
          });
        }
      },
    });
  }

  private archiveLocation(id: string): void {
    this.http
      .patch<LocationDto>(`/api/v1/locations/${id}`, { archived: true })
      .subscribe((updated) => {
        this.locations.update((items) => items.map((l) => (l.id === id ? updated : l)));
      });
  }
}
