// traces_to: L2-100
// Flag user-facing string literals in Angular templates that are not in a transloco pipe.
const TEXT_NODE_RE = /(^|>)\s*([^<>{}|]+?)\s*(<|$)/g;

function check(template) {
  const violations = [];
  let m;
  while ((m = TEXT_NODE_RE.exec(template)) !== null) {
    const text = m[2].trim();
    if (!text) continue;
    if (/^\s*\{\{\s*['"][^'"]+['"]\s*\|\s*transloco/.test(text)) continue;
    if (/^[\s\d\W]+$/.test(text)) continue;
    violations.push(`literal user-facing text not piped through transloco: "${text}"`);
  }
  return violations;
}

module.exports = { check };
