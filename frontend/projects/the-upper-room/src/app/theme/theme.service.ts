// traces_to: L2-115
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ACCESS_TOKEN_SOURCE } from 'domain';

export type ThemeMode = 'system' | 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly http = inject(HttpClient);
  private readonly tokenSource = inject(ACCESS_TOKEN_SOURCE);

  readonly mode = signal<ThemeMode>(this.read());

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    localStorage.setItem('theme', mode);
    this.apply(mode);
    if (this.tokenSource.current()) {
      this.http.patch('/api/v1/users/me', { theme: mode }).subscribe({ error: () => {} });
    }
  }

  private read(): ThemeMode {
    const v = localStorage.getItem('theme');
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
  }

  private apply(mode: ThemeMode): void {
    if (mode === 'system') {
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setAttr(dark ? 'dark' : null);
    } else {
      this.setAttr(mode);
    }
  }

  private setAttr(value: 'light' | 'dark' | null): void {
    if (value === null) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', value);
  }
}
