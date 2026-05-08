// traces_to: L2-082
// In a *.component.ts file, ban concrete *.service imports — require the InjectionToken
// from the sibling *.service.contract module.
function check(filename, source) {
  if (!/\.component\.ts$/.test(filename)) return [];
  const violations = [];
  const importRe = /import\s+\{[^}]*\}\s+from\s+['"][^'"]+\.service['"]/g;
  if (importRe.test(source)) {
    violations.push('component imported a concrete *.service module — import the InjectionToken from *.service.contract instead');
  }
  return violations;
}

module.exports = { check };
