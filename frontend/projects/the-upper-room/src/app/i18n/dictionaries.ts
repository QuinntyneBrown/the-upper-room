// traces_to: L2-100, L2-110
export const DICTIONARIES: Record<string, Record<string, string>> = {
  'en-CA': {
    'styleguide.greeting': 'Hello',
  },
  // Test-only fake locale used by the i18n e2e spec
  'xx-XX': {
    'styleguide.greeting': 'Bonjour-XX',
  },
};

export const DEFAULT_LOCALE = 'en-CA';
