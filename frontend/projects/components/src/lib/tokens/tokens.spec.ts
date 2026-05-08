// traces_to: L2-001, L2-003
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const tokens = readFileSync(resolve(__dirname, '_tokens.scss'), 'utf8');

describe('design tokens (SCSS source)', () => {
  it('declares the full M3 spacing scale', () => {
    for (const n of [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16, 20, 24]) {
      expect(tokens).toContain(`--md-sys-space-${n}`);
    }
  });

  it('declares all five elevation levels', () => {
    for (let n = 0; n <= 5; n++) {
      expect(tokens).toContain(`--md-sys-elevation-level-${n}`);
    }
  });

  it('declares the M3 type-scale slots', () => {
    for (const slot of [
      'display-large',
      'headline-large',
      'title-large',
      'body-large',
      'body-medium',
      'label-large',
    ]) {
      expect(tokens).toContain(`--md-sys-typescale-${slot}`);
    }
  });
});
