// traces_to: L2-107
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfirmService } from '../../../../../components/src/lib/confirm-dialog/confirm.service';
import { SnackbarService } from '../../../../../components/src/lib/snackbar/tar-snackbar.service';

export interface SessionRow {
  readonly id: string;
  readonly device: string;
  readonly location: string;
  readonly lastSeen: string;
  readonly current: boolean;
}

@Component({
  selector: 'app-sessions-card',
  templateUrl: './sessions-card.html',
  styleUrl: './sessions-card.scss',
})
export class SessionsCard implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly confirmer = inject(ConfirmService);
  private readonly snackbar = inject(SnackbarService);

  protected readonly sessions = signal<SessionRow[]>([]);
  protected readonly hasOthers = computed(() => this.sessions().some((s) => !s.current));

  ngOnInit(): void {
    this.http
      .get<{ items: SessionRow[] }>('/api/v1/users/me/sessions')
      .subscribe((r) => this.sessions.set(r.items));
  }

  protected async onSignOutOthers(): Promise<void> {
    const ok = await this.confirmer.confirm({
      title: 'Sign out other sessions?',
      body: 'You will stay signed in on this device.',
      severity: 'warning',
      confirmLabel: 'Sign out others',
    });
    if (!ok) return;
    this.http
      .post<{ revoked: number }>('/api/v1/users/me/sessions/revoke-others', {})
      .subscribe(({ revoked }) => {
        this.sessions.update((list) => list.filter((s) => s.current));
        this.snackbar.show(`Signed out from ${revoked} other devices`, 'info');
      });
  }
}
