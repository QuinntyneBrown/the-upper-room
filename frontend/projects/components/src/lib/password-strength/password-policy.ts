// traces_to: L2-019
const MIN_LEN = 12;
const MAX_LEN = 128;
const SYMBOLS = /[!@#$%^&*()_+\-=\[\]{}|;:'",.<>/?]/;

const COMMON_PASSWORDS = new Set<string>([
  'password',
  'password1',
  'password!',
  'password1!',
  'qwerty',
  'qwerty123',
  '123456',
  '123456789',
  'letmein',
  'welcome',
  'admin',
  'iloveyou',
  'monkey',
  'dragon',
]);

export interface PasswordRules {
  readonly length: boolean;
  readonly upper: boolean;
  readonly lower: boolean;
  readonly digit: boolean;
  readonly symbol: boolean;
}

export interface PasswordEvaluation {
  readonly score: number;
  readonly strong: boolean;
  readonly valid: boolean;
  readonly rules: PasswordRules;
  readonly helper: string | null;
}

export type PasswordEvaluator = (password: string, userEmail?: string) => PasswordEvaluation;

export const evaluatePassword: PasswordEvaluator = (password, userEmail = '') => {
  const rules: PasswordRules = {
    length: password.length >= MIN_LEN && password.length <= MAX_LEN,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /\d/.test(password),
    symbol: SYMBOLS.test(password),
  };
  const passing = Object.values(rules).filter(Boolean).length;

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return {
      score: 0,
      strong: false,
      valid: false,
      rules,
      helper: 'Password is too common. Choose a stronger password.',
    };
  }

  const localPart = userEmail.split('@')[0]?.toLowerCase().trim();
  if (localPart && localPart.length >= 3 && password.toLowerCase().includes(localPart)) {
    return {
      score: Math.max(0, passing - 2),
      strong: false,
      valid: false,
      rules,
      helper: 'Password may not contain your email or name.',
    };
  }

  const valid = passing === 5;
  return {
    score: passing,
    strong: valid,
    valid,
    rules,
    helper: valid ? null : 'Use 12+ characters with upper, lower, digit, and symbol.',
  };
};
