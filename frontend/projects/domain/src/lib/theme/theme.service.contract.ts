import { InjectionToken, WritableSignal } from '@angular/core';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface IThemeService {
  readonly mode: WritableSignal<ThemeMode>;

  setMode(mode: ThemeMode): void;
}

export const THEME_SERVICE = new InjectionToken<IThemeService>('THEME_SERVICE');
