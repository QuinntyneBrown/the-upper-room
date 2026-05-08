// traces_to: L2-100
import { describe, it, expect } from 'vitest';
import { check } from '../lib/i18n-no-literal.js';

describe('i18n-no-literal', () => {
  it('passes when literal text is piped through transloco', () => {
    expect(check(`<button>{{ 'save' | transloco }}</button>`)).toEqual([]);
  });

  it('flags raw user-facing text', () => {
    expect(check(`<button>Save changes</button>`).length).toBeGreaterThan(0);
  });
});
