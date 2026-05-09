// traces_to: L2-100, L2-110
import { Injectable, inject, signal } from '@angular/core';
import { TRANSLATE_DICTIONARIES, TRANSLATE_DEFAULT_LOCALE } from './translate.token';

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private readonly dicts = inject(TRANSLATE_DICTIONARIES);
  private readonly defaultLocale = inject(TRANSLATE_DEFAULT_LOCALE);

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
    // TODO: implement using injected dicts
    return '';
  }

  private detectLocale(): string {
    if (typeof window === 'undefined') return this.defaultLocale;
    const lang = new URLSearchParams(window.location.search).get('lang');
    return lang && this.dicts[lang] ? lang : this.defaultLocale;
  }
}
