// traces_to: L2-058, L2-113
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from '../../../../../components/src/lib/snackbar/tar-snackbar.service';

export interface LocationDetailDto {
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
  readonly photos: string[];
  readonly eventCount: number;
}

@Component({
  selector: 'app-location-detail',
  imports: [],
  templateUrl: './location-detail.html',
  styleUrl: './location-detail.scss',
})
export class LocationDetail implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackbar = inject(SnackbarService);

  private readonly maxPhotoBytes = 10 * 1024 * 1024;
  private locationId = '';

  protected readonly location = signal<LocationDetailDto | null>(null);
  protected readonly photoIndex = signal(0);

  protected readonly mapUrl = computed(() => {
    const loc = this.location();
    if (!loc?.lat || !loc?.lng) return null;
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${loc.lat},${loc.lng}&zoom=14&size=640x320`;
  });

  protected readonly currentPhoto = computed(() => {
    const loc = this.location();
    if (!loc || loc.photos.length === 0) return null;
    return loc.photos[this.photoIndex()];
  });

  ngOnInit(): void {
    this.locationId = this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  private load(): void {
    this.http
      .get<LocationDetailDto>(`/api/v1/locations/${this.locationId}`)
      .subscribe((loc) => {
        this.location.set(loc);
        this.photoIndex.set(Math.max(0, loc.photos.length - 1));
      });
  }

  protected nextPhoto(): void {
    const loc = this.location();
    if (!loc || loc.photos.length === 0) return;
    this.photoIndex.update((i) => (i + 1) % loc.photos.length);
  }

  protected prevPhoto(): void {
    const loc = this.location();
    if (!loc || loc.photos.length === 0) return;
    this.photoIndex.update((i) => (i - 1 + loc.photos.length) % loc.photos.length);
  }

  protected onPhotoFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (file.size > this.maxPhotoBytes) {
      this.snackbar.show('Photo is too large (max 10MB). Try a smaller image.', 'error');
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.snackbar.show('Only image files are accepted.', 'error');
      return;
    }

    const form = new FormData();
    form.append('file', file);
    this.http
      .post<LocationDetailDto>(`/api/v1/locations/${this.locationId}/photos`, form)
      .subscribe((updated) => {
        this.location.set(updated);
        this.photoIndex.set(updated.photos.length - 1);
      });
  }

  protected goToEvents(): void {
    this.router.navigateByUrl(`/events?locationId=${this.locationId}`);
  }
}
