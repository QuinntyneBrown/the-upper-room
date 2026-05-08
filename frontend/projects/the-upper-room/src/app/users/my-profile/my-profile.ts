// traces_to: L2-107, L2-106
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { SnackbarService } from '../../../../../components/src/lib/snackbar/tar-snackbar.service';
import { TarAvatarUploader } from '../../../../../components/src/lib/avatar/tar-avatar-uploader';
import { PermissionsService } from '../../rbac/permissions.service';
import { mapErrorToMessage } from '../../interceptors/error-catalog';

export interface ProfileForm {
  firstName: string;
  lastName: string;
  displayName: string;
  pronouns: string;
  title: string;
  city: string;
  timezone: string;
  locale: string;
  avatarUrl?: string | null;
  email?: string;
}

const EMPTY: ProfileForm = {
  firstName: '',
  lastName: '',
  displayName: '',
  pronouns: '',
  title: '',
  city: '',
  timezone: '',
  locale: '',
  avatarUrl: null,
};

import { SessionsCard } from '../sessions-card/sessions-card';

@Component({
  selector: 'app-my-profile',
  imports: [TarAvatarUploader, SessionsCard],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.scss',
})
export class MyProfile implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly snackbar = inject(SnackbarService);
  private readonly perms = inject(PermissionsService);

  protected readonly baseline = signal<ProfileForm>(EMPTY);
  protected readonly form = signal<ProfileForm>(EMPTY);

  protected readonly isDirty = computed(
    () => JSON.stringify(this.form()) !== JSON.stringify(this.baseline()),
  );

  protected readonly canEditCity = computed(() =>
    this.perms.snapshot().roles.includes('SystemAdmin'),
  );

  ngOnInit(): void {
    this.http.get<ProfileForm>('/api/v1/users/me/profile').subscribe((data) => {
      this.baseline.set(data);
      this.form.set(data);
    });
  }

  protected update(field: keyof ProfileForm, value: string): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  protected onSave(event: Event): void {
    event.preventDefault();
    if (!this.isDirty()) return;
    this.http
      .patch<ProfileForm>('/api/v1/users/me/profile', this.form())
      .subscribe((updated) => {
        this.baseline.set(updated);
        this.form.set(updated);
        this.snackbar.show('Profile updated', 'success');
      });
  }

  protected onCancel(): void {
    this.form.set(this.baseline());
  }

  protected onAvatarSelected(file: File): void {
    const body = new FormData();
    body.append('file', file);
    this.http.post<{ url: string }>('/api/v1/uploads', body).subscribe({
      next: ({ url }) => {
        const next = { ...this.form(), avatarUrl: url };
        this.form.set(next);
        this.baseline.set(next);
      },
      error: (err: HttpErrorResponse) => {
        const code = (err.error as { code?: string } | null)?.code;
        this.snackbar.show(mapErrorToMessage(err.status, code), 'error');
      },
    });
  }
}
