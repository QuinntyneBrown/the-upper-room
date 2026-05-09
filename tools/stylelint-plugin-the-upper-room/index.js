// traces_to: L2-003, L2-083
let stylelint;
try {
  stylelint = require('stylelint');
} catch {
  stylelint = require(require.resolve('stylelint', { paths: [process.cwd()] }));
}
const bem = require('./lib/bem-class-name.js');
const spacing = require('./lib/spacing-token-only.js');

const ruleBem = stylelint.createPlugin(
  'the-upper-room/bem-class-name',
  () => (root, result) => {
    root.walkRules((rule) => {
      const matches = rule.selector.match(/\.[a-zA-Z0-9_-]+/g) ?? [];
      for (const sel of matches) {
        const cls = sel.slice(1);
        const message = bem.check(cls);
        if (message) {
          stylelint.utils.report({ message, node: rule, result, ruleName: 'the-upper-room/bem-class-name' });
        }
      }
    });
  },
);

const ruleSpacing = stylelint.createPlugin(
  'the-upper-room/spacing-token-only',
  () => (root, result) => {
    root.walkDecls((decl) => {
      const message = spacing.check(decl.prop, decl.value);
      if (message) {
        stylelint.utils.report({ message, node: decl, result, ruleName: 'the-upper-room/spacing-token-only' });
      }
    });
  },
);

module.exports = [ruleBem, ruleSpacing];
