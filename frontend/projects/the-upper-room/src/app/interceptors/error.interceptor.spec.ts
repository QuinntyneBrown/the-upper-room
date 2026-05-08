// traces_to: L2-066
import { describe, it, expect } from 'vitest';
import { mapErrorToMessage } from './error-catalog';

describe('mapErrorToMessage', () => {
  it.each([
    [401, 'auth.invalid_credentials', 'The email or password is incorrect.'],
    [401, 'auth.session_expired', 'Your session has expired.'],
    [403, 'forbidden', "You don't have permission to do that."],
    [404, 'not_found', "We couldn't find what you're looking for."],
    [409, 'conflict', 'That action conflicts with another change.'],
    [429, 'rate_limited', 'Too many requests.'],
    [500, 'server.internal', 'Something went wrong on our end.'],
    [503, 'server.unavailable', 'Service temporarily unavailable.'],
    [400, 'validation.email', 'Enter a valid email address.'],
  ])('maps %i %s to "%s"', (status, code, expected) => {
    expect(mapErrorToMessage(status, code)).toBe(expected);
  });

  it('falls back to a generic message for unknown codes', () => {
    expect(mapErrorToMessage(500, 'unknown.code')).toBe('Something went wrong on our end.');
  });
});
