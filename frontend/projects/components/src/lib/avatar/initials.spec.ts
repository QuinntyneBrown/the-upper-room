// traces_to: L2-106
import { describe, it, expect } from 'vitest';
import { initials, deterministicColor } from './initials';

describe('initials', () => {
  it('uses the first two letters of the display name', () => {
    expect(initials({ displayName: 'Alice Brown' })).toBe('AB');
    expect(initials({ displayName: 'cher' })).toBe('CH');
  });

  it('falls back to email local part when display is empty', () => {
    expect(initials({ email: 'alice@example.com' })).toBe('AL');
  });

  it('returns ?? for empty input', () => {
    expect(initials({})).toBe('??');
  });
});

describe('deterministicColor', () => {
  it('returns the same hue for the same identifier', () => {
    const a = deterministicColor('alice@example.com');
    const b = deterministicColor('alice@example.com');
    expect(a).toBe(b);
  });

  it('returns different hues for different identifiers', () => {
    expect(deterministicColor('alice')).not.toBe(deterministicColor('bob'));
  });
});
