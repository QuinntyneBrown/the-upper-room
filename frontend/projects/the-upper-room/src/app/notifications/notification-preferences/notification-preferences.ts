// traces_to: L2-064
import { Component, OnInit, inject, signal } from '@angular/core';
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

  protected readonly prefs = signal<PrefDto[]>([]);
  protected readonly savedCode = signal<string | null>(null);

  private readonly debounces = new Map<string, ReturnType<typeof setTimeout>>();

  ngOnInit(): void {
    this.http
      .get<PrefDto[]>('/api/v1/notifications/preferences')
      .subscribe((data) => this.prefs.set(data));
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
