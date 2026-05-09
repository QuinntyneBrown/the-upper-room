// traces_to: L2-081, L2-082, L2-100, L2-102
const tur = require('../tools/eslint-plugin-the-upper-room/index.js');
const rawSourceParser = require('../tools/eslint-plugin-the-upper-room/lib/raw-source-parser.js');

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**', '.angular/**', '.playwright-cli/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: { parser: rawSourceParser },
    plugins: { 'the-upper-room': tur },
    rules: {
      'the-upper-room/component-file-per-type': 'error',
      'the-upper-room/contract-token-import': 'error',
      'the-upper-room/playwright-no-raw-locators': 'error',
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: { parser: rawSourceParser },
    plugins: { 'the-upper-room': tur },
    rules: { 'the-upper-room/i18n-no-literal': 'warn' },
  },
];
