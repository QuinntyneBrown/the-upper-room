// traces_to: L2-083
// BEM regex: block, optional __element, optional --modifier. Allow-list common framework prefixes + utility.
const BEM_RE = /^(mat-|mdc-|cdk-|u-|[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?)$/;

function check(className) {
  if (BEM_RE.test(className)) return null;
  return `class name "${className}" does not match BEM (block__element--modifier) or allow-list`;
}

module.exports = { check };
