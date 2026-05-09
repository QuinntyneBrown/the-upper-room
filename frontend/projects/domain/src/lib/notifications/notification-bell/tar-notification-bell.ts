// traces_to: L2-062
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TarButton, TarIconButton } from 'components';

export interface NotificationDto {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly body: string;
  readonly data: Record<string, string> | null;
  readonly read: boolean;
  readonly createdAt: string;
  readonly deepLink: string | null;
  readonly severity: string;
}

type Tab = 'unread' | 'all';

@Component({
  selector: 'tar-notification-bell',
  imports: [DatePipe, LowerCasePipe, RouterLink, MatButtonModule, MatIconModule, TarButton, TarIconButton],
  templateUrl: './tar-notification-bell.html',
  styleUrl: './tar-notification-bell.scss',
})
export class TarNotificationBell implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  protected readonly notifications = signal<NotificationDto[]>([]);
  protected readonly open = signal(false);
  protected readonly activeTab = signal<Tab>('unread');

  protected readonly unread = computed(() => this.notifications().filter((n) => !n.read));
  protected readonly unreadCount = computed(() => this.unread().length);
  protected readonly badgeLabel = computed(() => {
    const n = this.unreadCount();
    return n > 99 ? '99+' : String(n);
  });
  protected readonly visibleRows = computed(() =>
    this.activeTab() === 'unread' ? this.unread() : this.notifications(),
  );

  ngOnInit(): void {
    this.load();
  }

  protected toggleMenu(): void {
    this.open.update((v) => !v);
  }

  protected setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  protected onRowClick(n: NotificationDto): void {
    this.http.post<NotificationDto>(`/api/v1/notifications/${n.id}/read`, {}).subscribe((updated) => {
      this.notifications.update((list) => list.map((x) => (x.id === n.id ? updated : x)));
      if (n.deepLink) {
        this.open.set(false);
        void this.router.navigateByUrl(n.deepLink);
      }
    });
  }

  protected markAllRead(): void {
    this.http.post('/api/v1/notifications/read-all', {}).subscribe(() => {
      this.notifications.update((list) => list.map((n) => ({ ...n, read: true })));
    });
  }

  private load(): void {
    this.http
      .get<{ items: NotificationDto[]; total: number }>('/api/v1/notifications')
      .subscribe((r) => this.notifications.set(r.items));
  }
}
