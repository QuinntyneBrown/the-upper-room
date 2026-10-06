// traces_to: L2-102
const tur = require('eslint-plugin-the-upper-room');
const rawSourceParser = require('eslint-plugin-the-upper-room/lib/raw-source-parser.js');

module.exports = [
  {
    ignores: ['node_modules/**', 'test-results/**', 'playwright-report/**', '.playwright-cli/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: { parser: rawSourceParser },
    plugins: { 'the-upper-room': tur },
    rules: {
      'the-upper-room/playwright-no-raw-locators': 'error',
    },
  },
];
