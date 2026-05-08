// traces_to: L2-081, L2-082, L2-100, L2-102
const componentFilePerType = require('./lib/component-file-per-type.js');
const i18nNoLiteral = require('./lib/i18n-no-literal.js');
const contractTokenImport = require('./lib/contract-token-import.js');
const playwrightNoRawLocators = require('./lib/playwright-no-raw-locators.js');

function makeRule(check, signature) {
  return {
    meta: { type: 'problem', schema: [], messages: { v: '{{message}}' } },
    create(context) {
      return {
        Program(node) {
          const source = context.sourceCode.text;
          const filename = context.filename ?? context.getFilename();
          const violations =
            signature === 'src' ? check(source) : check(filename, source);
          for (const message of violations) {
            context.report({ node, messageId: 'v', data: { message } });
          }
        },
      };
    },
  };
}

module.exports = {
  rules: {
    'component-file-per-type': makeRule(componentFilePerType.check, 'src'),
    'i18n-no-literal': makeRule(i18nNoLiteral.check, 'src'),
    'contract-token-import': makeRule(contractTokenImport.check, 'fileAndSrc'),
    'playwright-no-raw-locators': makeRule(playwrightNoRawLocators.check, 'fileAndSrc'),
  },
};
