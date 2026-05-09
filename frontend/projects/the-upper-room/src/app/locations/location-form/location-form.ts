// traces_to: L2-057, L2-058
import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SnackbarService } from 'components';
import type { LocationDto } from '../location-list/location-list';

@Component({
  selector: 'app-location-form',
  imports: [],
  templateUrl: './location-form.html',
  styleUrl: './location-form.scss',
})
export class LocationForm {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly snackbar = inject(SnackbarService);

  protected readonly name = signal('');
  protected readonly street = signal('');
  protected readonly city = signal('');
  protected readonly state = signal('');
  protected readonly country = signal('');
  protected readonly postalCode = signal('');
  protected readonly capacity = signal('');
  protected readonly lat = signal('');
  protected readonly lng = signal('');

  protected readonly nameError = signal<string | null>(null);
  protected readonly capacityError = signal<string | null>(null);

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.nameError.set(null);
    this.capacityError.set(null);

    if (!this.name().trim()) {
      this.nameError.set('Name is required.');
      return;
    }

    const capacityRaw = this.capacity().trim();
    let capacityVal: number | null = null;
    if (capacityRaw !== '') {
      const parsed = Number(capacityRaw);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        this.capacityError.set('Capacity must be a positive integer.');
        return;
      }
      capacityVal = parsed;
    }

    this.http
      .post<LocationDto>('/api/v1/locations', {
        name: this.name().trim(),
        street: this.street().trim(),
        city: this.city().trim(),
        state: this.state().trim(),
        country: this.country().trim(),
        postalCode: this.postalCode().trim(),
        capacity: capacityVal,
        lat: this.lat() ? Number(this.lat()) : null,
        lng: this.lng() ? Number(this.lng()) : null,
      })
      .subscribe({
        next: () => {
          this.snackbar.show('Location created', 'success');
          this.router.navigateByUrl('/locations');
        },
      });
  }

  protected onCancel(): void {
    this.router.navigateByUrl('/locations');
  }
}
