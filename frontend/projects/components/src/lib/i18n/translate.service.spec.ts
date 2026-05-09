// traces_to: L2-100
import { TestBed } from '@angular/core/testing';
import { TranslateService } from './translate.service';
import { TRANSLATE_DICTIONARIES, TRANSLATE_DEFAULT_LOCALE } from './translate.token';

const TEST_DICTS: Record<string, Record<string, string>> = {
  'en-CA': { 'hello': 'Hello', 'world': 'World' },
  'fr-CA': { 'hello': 'Bonjour', 'world': 'Monde' },
};

describe('TranslateService (components library)', () => {
  function setup(dicts = TEST_DICTS, defaultLocale = 'en-CA') {
    TestBed.configureTestingModule({
      providers: [
        { provide: TRANSLATE_DICTIONARIES, useValue: dicts },
        { provide: TRANSLATE_DEFAULT_LOCALE, useValue: defaultLocale },
      ],
    });
    return TestBed.inject(TranslateService);
  }

  it('translates a key using injected dictionaries', () => {
    const svc = setup();
    expect(svc.translate('hello')).toBe('Hello');
  });

  it('switches locale via setLocale()', () => {
    const svc = setup();
    svc.setLocale('fr-CA');
    expect(svc.translate('hello')).toBe('Bonjour');
  });

  it('falls back to key name when translation is missing', () => {
    const svc = setup();
    expect(svc.translate('nope.missing')).toBe('nope.missing');
  });

  it('uses fallback locale dict when current locale dict is missing', () => {
    const svc = setup();
    svc.setLocale('de-DE');
    expect(svc.translate('hello')).toBe('Hello');
  });
});
