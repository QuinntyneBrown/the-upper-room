// traces_to: L2-107
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SnackbarService } from '../../../../../components/src/lib/snackbar/tar-snackbar.service';
import { PermissionsService } from '../../rbac/permissions.service';

export interface ProfileForm {
  firstName: string;
  lastName: string;
  displayName: string;
  pronouns: string;
  title: string;
  city: string;
  timezone: string;
  locale: string;
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
};

@Component({
  selector: 'app-my-profile',
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
}
