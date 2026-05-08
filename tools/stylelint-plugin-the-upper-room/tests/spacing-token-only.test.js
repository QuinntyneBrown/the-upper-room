// traces_to: L2-003
import { describe, it, expect } from 'vitest';
import { check } from '../lib/spacing-token-only.js';

describe('spacing-token-only', () => {
  it('passes for var() tokens', () => {
    expect(check('padding', 'var(--md-sys-space-4)')).toBeNull();
  });

  it('passes for 0 and 1px sentinels', () => {
    expect(check('margin', '0')).toBeNull();
    expect(check('padding', '1px')).toBeNull();
  });

  it('flags raw px on padding', () => {
    expect(check('padding', '16px')).toMatch(/var\(--md-sys-space/);
  });

  it('ignores non-spacing properties', () => {
    expect(check('width', '16px')).toBeNull();
  });
});
