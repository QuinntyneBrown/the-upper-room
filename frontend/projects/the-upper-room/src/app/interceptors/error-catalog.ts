// traces_to: L2-066
const CATALOG: Record<string, string> = {
  'network.offline': "You're offline.",
  'network.timeout': 'The request timed out.',
  'auth.invalid_credentials': 'The email or password is incorrect.',
  'auth.account_locked': 'Your account is locked.',
  'auth.session_expired': 'Your session has expired.',
  'auth.email_not_verified': 'Verify your email to continue.',
  forbidden: "You don't have permission to do that.",
  not_found: "We couldn't find what you're looking for.",
  conflict: 'That action conflicts with another change.',
  'validation.required': 'This field is required.',
  'validation.email': 'Enter a valid email address.',
  'validation.phone': 'Enter a valid phone number, e.g. +1 555 123 4567.',
  'validation.url': 'Enter a valid URL, e.g. https://example.com.',
  'validation.password_weak': 'Password is too weak.',
  'validation.duplicate': 'A record with this value already exists.',
  rate_limited: 'Too many requests.',
  'server.internal': 'Something went wrong on our end.',
  'server.unavailable': 'Service temporarily unavailable.',
  'upload.too_large': 'File is too large.',
  'upload.unsupported_type': 'Unsupported file type.',
  'csrf.invalid': 'Your action could not be verified.',
};

const FALLBACK_BY_STATUS: Record<number, string> = {
  401: CATALOG['auth.invalid_credentials']!,
  403: CATALOG['forbidden']!,
  404: CATALOG['not_found']!,
  409: CATALOG['conflict']!,
  413: CATALOG['upload.too_large']!,
  415: CATALOG['upload.unsupported_type']!,
  429: CATALOG['rate_limited']!,
  500: CATALOG['server.internal']!,
  503: CATALOG['server.unavailable']!,
};

/**
 * Catalog codes win, then the catalog's per-status fallback; a human-readable
 * server message is used only for a client error the catalog does not cover.
 */
export function mapErrorToMessage(status: number, code?: string, serverMessage?: string): string {
  if (code && CATALOG[code]) return CATALOG[code]!;
  if (FALLBACK_BY_STATUS[status]) return FALLBACK_BY_STATUS[status]!;
  if (!code && serverMessage && status < 500) return serverMessage;
  return CATALOG['server.internal']!;
}
