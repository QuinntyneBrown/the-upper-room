// traces_to: L2-028
import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { UserRow } from 'api';
import { TarButton, TarIconButton, TarSelect } from 'components';
import { PERMISSIONS_SERVICE } from '../../rbac/permissions.contract';

@Component({
  selector: 'tar-user-detail-drawer',
  imports: [TarButton, TarIconButton, TarSelect],
  templateUrl: './user-detail-drawer.html',
  styleUrl: './user-detail-drawer.scss',
})
export class UserDetailDrawer {
  private readonly perms = inject(PERMISSIONS_SERVICE);

  @Input({ required: true }) set user(value: UserRow) {
    this._user.set(value);
  }
  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly disableRequested = new EventEmitter<UserRow>();
  @Output() readonly deleteRequested = new EventEmitter<UserRow>();
  @Output() readonly resetPasswordRequested = new EventEmitter<UserRow>();
  @Output() readonly roleChanged = new EventEmitter<{ user: UserRow; role: string }>();

  protected readonly _user = signal<UserRow | null>(null);
  protected readonly roles = ['SystemAdmin', 'CityLead', 'Member', 'Guest'];
  protected readonly roleOptions = this.roles.map((r) => ({ label: r, value: r }));

  protected readonly isSelf = computed(() => this._user()?.id === this.perms.snapshot().userId);

  protected onRole(value: string): void {
    const user = this._user();
    if (user) this.roleChanged.emit({ user, role: value });
  }
}
