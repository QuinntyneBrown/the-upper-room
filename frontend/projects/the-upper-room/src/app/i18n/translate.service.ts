// traces_to: L2-100, L2-110
import { Injectable, signal } from '@angular/core';
import { DICTIONARIES, DEFAULT_LOCALE } from './dictionaries';

@Injectable({ providedIn: 'root' })
export class TranslateService {
  readonly locale = signal(this.detectLocale());

  constructor() {
    if (typeof window !== 'undefined') {
      (window as unknown as { __translate: TranslateService }).__translate = this;
    }
  }

  setLocale(locale: string): void {
    this.locale.set(locale);
  }

  translate(key: string): string {
    const dict = DICTIONARIES[this.locale()] ?? DICTIONARIES[DEFAULT_LOCALE]!;
    const value = dict[key];
    if (value === undefined) {
      console.warn(`[i18n] missing key: ${key}`);
      return key;
    }
    return value;
  }

  private detectLocale(): string {
    if (typeof window === 'undefined') return DEFAULT_LOCALE;
    const lang = new URLSearchParams(window.location.search).get('lang');
    return lang && DICTIONARIES[lang] ? lang : DEFAULT_LOCALE;
  }
}
