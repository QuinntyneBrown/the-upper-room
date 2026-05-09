// traces_to: L2-027
import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { InvitePayload } from 'api';
import { TarButton, TarDialog, TarSelect, TarTextarea, TarTextField } from 'components';

const ROLES = ['Member', 'CityLead', 'SystemAdmin'];

@Component({
  selector: 'tar-invite-user-dialog',
  imports: [TarButton, TarDialog, TarSelect, TarTextarea, TarTextField],
  templateUrl: './invite-user-dialog.html',
  styleUrl: './invite-user-dialog.scss',
})
export class InviteUserDialog {
  @Input({ required: true }) emailError: string | null = null;
  @Output() readonly submitted = new EventEmitter<InvitePayload>();
  @Output() readonly cancelled = new EventEmitter<void>();

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
    this.submitted.emit({
      email: this.email(),
      firstName: this.firstName(),
      lastName: this.lastName(),
      role: this.role(),
      city: this.city(),
      message: this.message(),
    });
  }
}
