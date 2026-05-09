import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { TRANSLATE_DICTIONARIES } from './i18n/translate.token';

export interface TarComponentsOptions {
  dictionaries?: Record<string, Record<string, string>>;
}

/**
 * Registers environment providers required by the components library.
 * Pass `dictionaries` to supply translated strings for the `transloco` pipe.
 */
export function provideTarComponents(options: TarComponentsOptions = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    options.dictionaries
      ? { provide: TRANSLATE_DICTIONARIES, useValue: options.dictionaries }
      : [],
  ]);
}
