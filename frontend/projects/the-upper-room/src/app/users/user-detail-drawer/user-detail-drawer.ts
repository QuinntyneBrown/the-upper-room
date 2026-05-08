// traces_to: L2-028
import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { PermissionsService } from '../../rbac/permissions.service';
import type { UserRow } from '../user-list/user-list';

@Component({
  selector: 'app-user-detail-drawer',
  templateUrl: './user-detail-drawer.html',
  styleUrl: './user-detail-drawer.scss',
})
export class UserDetailDrawer {
  private readonly perms = inject(PermissionsService);

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

  protected readonly isSelf = computed(() => this._user()?.id === this.perms.snapshot().userId);

  protected onRole(value: string): void {
    const user = this._user();
    if (user) this.roleChanged.emit({ user, role: value });
  }
}
