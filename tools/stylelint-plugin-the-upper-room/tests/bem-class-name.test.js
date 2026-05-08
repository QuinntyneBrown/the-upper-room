// traces_to: L2-083
import { describe, it, expect } from 'vitest';
import { check } from '../lib/bem-class-name.js';

describe('bem-class-name', () => {
  it.each([
    'block',
    'block-name',
    'block__element',
    'block__element--modifier',
    'mat-card',
    'cdk-overlay',
    'u-grid',
  ])('accepts %s', (cls) => {
    expect(check(cls)).toBeNull();
  });

  it.each(['BlockName', 'block_element', '__elementOnly', 'block--MOD'])(
    'rejects %s',
    (cls) => {
      expect(check(cls)).toMatch(/BEM/);
    },
  );
});
