// traces_to: L2-102
// In e2e/tests/**/*.spec.ts, ban direct use of page.locator / page.getByX — only POMs may resolve locators.
const RAW_RE = /\bpage\s*\.\s*(locator|getBy[A-Z]\w*)\s*\(/g;

function check(filename, source) {
  if (!/[\\/]e2e[\\/]tests[\\/].+\.spec\.ts$/.test(filename)) return [];
  const violations = [];
  let m;
  while ((m = RAW_RE.exec(source)) !== null) {
    violations.push(`raw locator 'page.${m[1]}' in spec — move it onto a Page Object`);
  }
  return violations;
}

module.exports = { check };
