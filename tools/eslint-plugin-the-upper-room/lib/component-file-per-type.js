// traces_to: L2-081
// Pure check: returns an array of violations for a given source string.
const TEMPLATE_RE = /@Component\s*\(\s*\{[^}]*\btemplate\s*:/s;
const STYLES_RE = /\bstyles\s*:\s*\[\s*[^\]]/;
const STYLE_URLS_MULTI = /\bstyleUrls\s*:\s*\[\s*[^\]]+,\s*[^\]]+/;

function check(source) {
  const violations = [];
  if (TEMPLATE_RE.test(source)) {
    violations.push("inline 'template:' is forbidden — use templateUrl");
  }
  if (STYLES_RE.test(source)) {
    violations.push("inline 'styles:' arrays are forbidden — use styleUrl");
  }
  if (STYLE_URLS_MULTI.test(source)) {
    violations.push("'styleUrls' must contain at most one entry — prefer styleUrl");
  }
  return violations;
}

module.exports = { check };
