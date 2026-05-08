// traces_to: L2-081
import { describe, it, expect } from 'vitest';
import { check } from '../lib/component-file-per-type.js';

describe('component-file-per-type', () => {
  it('passes when component uses templateUrl + styleUrl', () => {
    const src = `@Component({ templateUrl: './x.html', styleUrl: './x.scss' })`;
    expect(check(src)).toEqual([]);
  });

  it('flags inline template:', () => {
    const src = `@Component({ template: '<h1>x</h1>' })`;
    expect(check(src).some((v) => v.includes('template'))).toBe(true);
  });

  it('flags inline styles: array', () => {
    const src = `@Component({ templateUrl: './x.html', styles: ['h1{}'] })`;
    expect(check(src).some((v) => v.includes('styles'))).toBe(true);
  });
});
