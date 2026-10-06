/**
 * Reads the design tokens straight from the live stylesheet: every custom
 * property declared on `:root` by `src/lib/tokens/_tokens.scss` (loaded with
 * the app's `styles.scss`). Nothing is copied, so these pages cannot drift
 * from what the components render. Values are resolved with
 * `getComputedStyle`, so the dark toolbar setting shows the dark scheme.
 */

let names;

/** Every `--md-sys-*` / `--icon-size-*` custom property declared on `:root`, in source order. */
function tokenNames() {
  if (names) return names;
  const found = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // cross-origin (web fonts)
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule) || rule.selectorText !== ':root') continue;
      for (const prop of Array.from(rule.style)) {
        if (/^--(md-sys-|icon-size-)/.test(prop) && !found.includes(prop)) found.push(prop);
      }
    }
  }
  names = found;
  return names;
}

/** `{ name, value }` for every token whose name starts with one of `prefixes` (without `--`). */
export function byPrefix(...prefixes) {
  const style = getComputedStyle(document.documentElement);
  return tokenNames()
    .map((prop) => prop.slice(2))
    .filter((name) => prefixes.some((p) => name.startsWith(p)))
    .map((name) => ({ name, value: style.getPropertyValue(`--${name}`).trim() }));
}
