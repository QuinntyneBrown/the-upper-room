// traces_to: L2-003
// In `margin`/`padding` declarations, every literal px value must be 0 or 1px;
// non-trivial spacing must reference a CSS variable token.
function check(prop, value) {
  if (prop !== 'margin' && prop !== 'padding') return null;
  for (const tok of value.split(/\s+/)) {
    if (!/px$/.test(tok)) continue;
    if (tok === '0' || tok === '0px' || tok === '1px') continue;
    return `use var(--md-sys-space-*) instead of literal ${tok} in ${prop}`;
  }
  return null;
}

module.exports = { check };
