// traces_to: L2-027
import { Component, Signal, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { InvitePayload } from 'api';
import { TarButton, TarSelect, TarTextarea, TarTextField } from 'components';

const ROLES = ['Member', 'CityLead', 'SystemAdmin'];

export interface InviteUserDialogData {
  readonly emailError: Signal<string | null>;
  readonly onSubmit: (payload: InvitePayload) => void;
}

@Component({
  selector: 'tar-invite-user-dialog',
  imports: [MatDialogModule, TarButton, TarSelect, TarTextarea, TarTextField],
  templateUrl: './invite-user-dialog.html',
  styleUrl: './invite-user-dialog.scss',
  host: {
    'data-testid': 'invite-dialog',
  },
})
export class InviteUserDialog {
  protected readonly data = inject<InviteUserDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<InviteUserDialog>>(MatDialogRef);

  protected readonly email = signal('');
  protected readonly firstName = signal('');
  protected readonly lastName = signal('');
  protected readonly role = signal('Member');
  protected readonly city = signal('');
  protected readonly message = signal('');
  protected readonly roles = ROLES;
  protected readonly roleOptions = ROLES.map((r) => ({ label: r, value: r }));

  protected readonly canSubmit = computed(() =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email()) &&
    this.firstName().trim().length > 0 &&
    this.lastName().trim().length > 0 &&
    this.city().trim().length > 0,
  );

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.canSubmit()) return;
    this.data.onSubmit({
      email: this.email(),
      firstName: this.firstName(),
      lastName: this.lastName(),
      role: this.role(),
      city: this.city(),
      message: this.message(),
    });
  }

  protected onCancel(): void {
    this.ref.close();
  }
}
