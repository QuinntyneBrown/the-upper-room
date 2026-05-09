// traces_to: L2-064, L2-063
import { Component, OnInit, inject, signal, DOCUMENT } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface PrefDto {
  readonly code: string;
  inApp: boolean;
  email: boolean;
  push: boolean;
}

@Component({
  selector: 'app-notification-preferences',
  templateUrl: './notification-preferences.html',
  styleUrl: './notification-preferences.scss',
})
export class NotificationPreferences implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly doc = inject(DOCUMENT);

  protected readonly prefs = signal<PrefDto[]>([]);
  protected readonly savedCode = signal<string | null>(null);
  protected readonly pushSubscribed = signal(false);

  private readonly debounces = new Map<string, ReturnType<typeof setTimeout>>();

  ngOnInit(): void {
    this.http
      .get<PrefDto[]>('/api/v1/notifications/preferences')
      .subscribe((data) => this.prefs.set(data));
    this.checkPushStatus();
  }

  private async checkPushStatus(): Promise<void> {
    const sw = this.doc.defaultView?.navigator?.serviceWorker;
    if (!sw) return;
    const reg = await sw.ready;
    const sub = await reg.pushManager.getSubscription();
    this.pushSubscribed.set(!!sub);
  }

  protected async enablePush(): Promise<void> {
    const win = this.doc.defaultView;
    if (!win) return;
    const sw = win.navigator?.serviceWorker;
    if (!sw) return;
    const reg = await sw.ready;
    const keyRes = await win.fetch('/api/v1/push/vapid-public-key');
    const keyText = await keyRes.text();
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyText,
    });
    this.http.post('/api/v1/push/subscribe', sub.toJSON()).subscribe(() => {
      this.pushSubscribed.set(true);
    });
  }

  protected async disablePush(): Promise<void> {
    const sw = this.doc.defaultView?.navigator?.serviceWorker;
    if (!sw) return;
    const reg = await sw.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
    this.http.delete('/api/v1/push/subscribe').subscribe(() => {
      this.pushSubscribed.set(false);
    });
  }

  protected onToggle(code: string, field: 'inApp' | 'email' | 'push'): void {
    this.prefs.update((list) =>
      list.map((p) => (p.code === code ? { ...p, [field]: !p[field] } : p)),
    );

    const existing = this.debounces.get(code);
    if (existing) clearTimeout(existing);

    this.debounces.set(
      code,
      setTimeout(() => {
        const pref = this.prefs().find((p) => p.code === code);
        if (!pref) return;
        this.http.put('/api/v1/notifications/preferences', pref).subscribe(() => {
          this.savedCode.set(code);
          setTimeout(() => this.savedCode.set(null), 2000);
        });
      }, 1000),
    );
  }
}
