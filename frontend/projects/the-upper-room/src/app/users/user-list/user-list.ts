// traces_to: L2-026, L2-027, L2-028
import {
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import {
  ConfirmService,
  SnackbarService,
  TarButton,
  TarEmptyState,
  TarSearchField,
  TarSelect,
} from 'components';
import { InvitePayload, UserRow } from 'api';
import { InviteUserDialog, InviteUserDialogData, UserDetailDrawer } from 'domain';

export type { UserRow } from 'api';

interface ListResponse {
  readonly items: UserRow[];
  readonly total: number;
}

const ROLES = ['All', 'SystemAdmin', 'CityLead', 'Member', 'Guest'] as const;
type RoleFilter = (typeof ROLES)[number];

@Component({
  selector: 'app-user-list',
  imports: [
    TarEmptyState,
    TarSearchField,
    TarButton,
    TarSelect,
    MatChipsModule,
    MatTableModule,
    UserDetailDrawer,
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly snackbar = inject(SnackbarService);
  private readonly confirmer = inject(ConfirmService);
  private readonly dialog = inject(MatDialog);

  protected readonly searchInput = signal('');
  protected readonly debouncedSearch = signal('');
  protected readonly roleFilter = signal<RoleFilter>('All');
  protected readonly pageSize = signal(25);
  protected readonly page = signal(1);

  protected readonly users = signal<UserRow[]>([]);
  protected readonly total = signal(0);
  protected readonly isEmpty = computed(() => this.users().length === 0);
  protected readonly roles = ROLES;
  protected readonly displayedColumns = ['name', 'email', 'role', 'city', 'status', 'lastSignIn'];
  protected readonly pageSizeOptions = [
    { label: '25', value: '25' },
    { label: '50', value: '50' },
    { label: '100', value: '100' },
  ];

  protected readonly selectedUser = signal<UserRow | null>(null);

  private debounceId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      this.fetch(this.debouncedSearch(), this.roleFilter(), this.pageSize(), this.page());
    });
  }

  ngOnDestroy(): void {
    if (this.debounceId !== null) clearTimeout(this.debounceId);
  }

  protected onSearch(value: string): void {
    this.searchInput.set(value);
    if (this.debounceId !== null) clearTimeout(this.debounceId);
    this.debounceId = setTimeout(() => this.debouncedSearch.set(value), 300);
  }

  protected onRole(role: RoleFilter): void {
    this.roleFilter.set(role);
  }

  protected onPageSize(value: string): void {
    this.pageSize.set(Number(value));
  }

  protected openInvite(): void {
    const emailError = signal<string | null>(null);
    const data: InviteUserDialogData = {
      emailError,
      onSubmit: (payload) => this.submitInvite(payload, emailError, ref),
    };
    const ref = this.dialog.open<InviteUserDialog, InviteUserDialogData>(InviteUserDialog, { data });
  }

  private submitInvite(
    payload: InvitePayload,
    emailError: ReturnType<typeof signal<string | null>>,
    ref: { close: () => void },
  ): void {
    this.http.post<{ id: string }>('/api/v1/invitations', payload).subscribe({
      next: ({ id }) => {
        ref.close();
        this.snackbar.show(`Invitation sent to ${payload.email}`, 'success', {
          label: 'Undo',
          onClick: () => this.revokeInvitation(id),
        });
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          emailError.set('This email already has a pending invitation.');
        }
      },
    });
  }

  protected selectUser(user: UserRow): void {
    this.selectedUser.set(user);
  }

  protected closeDrawer(): void {
    this.selectedUser.set(null);
  }

  protected async onDisable(user: UserRow): Promise<void> {
    const ok = await this.confirmer.confirm({
      title: `Disable ${user.name}?`,
      body: 'Disabled users cannot sign in.',
      severity: 'warning',
      confirmLabel: 'Disable',
    });
    if (!ok) return;
    this.http.post(`/api/v1/users/${user.id}/disable`, {}).subscribe(() => {
      this.users.update((list) =>
        list.map((u) => (u.id === user.id ? { ...u, status: 'Disabled' } : u)),
      );
      this.selectedUser.update((u) => (u && u.id === user.id ? { ...u, status: 'Disabled' } : u));
      this.snackbar.show('User disabled', 'info');
    });
  }

  protected onRoleChange(payload: { user: UserRow; role: string }): void {
    this.http.patch(`/api/v1/users/${payload.user.id}`, { role: payload.role }).subscribe(() => {
      this.users.update((list) =>
        list.map((u) => (u.id === payload.user.id ? { ...u, role: payload.role } : u)),
      );
      this.selectedUser.update((u) =>
        u && u.id === payload.user.id ? { ...u, role: payload.role } : u,
      );
    });
  }

  private revokeInvitation(id: string): void {
    this.http.delete(`/api/v1/invitations/${id}`).subscribe({
      next: () => this.snackbar.show('Invitation revoked', 'info'),
    });
  }

  private fetch(search: string, role: RoleFilter, pageSize: number, page: number): void {
    let params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
    if (search) params = params.set('search', search);
    if (role !== 'All') params = params.set('role', role);
    this.http
      .get<ListResponse>('/api/v1/users', { params })
      .subscribe({
        next: (r) => {
          this.users.set(r.items);
          this.total.set(r.total);
        },
        error: () => {
          this.users.set([]);
          this.total.set(0);
        },
      });
  }
}
