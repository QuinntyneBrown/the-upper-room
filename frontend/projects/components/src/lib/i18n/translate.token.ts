// traces_to: L2-100
import { InjectionToken } from '@angular/core';

export const TRANSLATE_DICTIONARIES = new InjectionToken<Record<string, Record<string, string>>>(
  'TRANSLATE_DICTIONARIES',
  { providedIn: 'root', factory: () => ({}) },
);

export const TRANSLATE_DEFAULT_LOCALE = new InjectionToken<string>(
  'TRANSLATE_DEFAULT_LOCALE',
  { providedIn: 'root', factory: () => 'en-CA' },
);
