---
id: TASK-0006
title: Lint rules — BEM, file-per-type, spacing tokens, i18n literals, contract tokens, Playwright POM
status: Draft
phase: F
depends_on: [TASK-0001]
traces_to: [L2-003, L2-081, L2-082, L2-083, L2-100, L2-102]
estimated_context: medium
---

# TASK-0006: Custom lint rules

## Goal
Author and register the project's six bespoke lint rules so that any violation fails CI:
- `the-upper-room/component-file-per-type` (ESLint) — bans inline `template:` / `styles:` / `styleUrls` arrays >1 entry, and bans missing sibling `.html`/`.scss`.
- `the-upper-room/bem-class-name` (Stylelint) — regex-enforces BEM (allow-list `mat-*`, `mdc-*`, `cdk-*`, `u-*`).
- `the-upper-room/spacing-token-only` (Stylelint) — bans literal px in `margin`/`padding` outside 0/1px borders.
- `the-upper-room/i18n-no-literal` (ESLint plugin for Angular templates) — flags literal user-facing strings outside transloco pipes.
- `the-upper-room/contract-token-import` (ESLint) — bans concrete service class import in components; demands the injection token from `*.service.contract.ts`.
- `the-upper-room/playwright-no-raw-locators` (ESLint) — bans `page.locator(...)` and `page.getByXxx(...)` inside `e2e/tests/**/*.spec.ts`; only Page Object methods may resolve locators.

## ATDD Process — REQUIRED
Write a passing-AND-failing fixture pair for each rule first as a unit test of the rule, then implement.

## Acceptance Tests

### Unit (Lint rule tests)
- `eslint-plugin-the-upper-room/tests/component-file-per-type.test.ts`
- `eslint-plugin-the-upper-room/tests/i18n-no-literal.test.ts`
- `eslint-plugin-the-upper-room/tests/contract-token-import.test.ts`
- `eslint-plugin-the-upper-room/tests/playwright-no-raw-locators.test.ts`
- `stylelint-plugin-the-upper-room/tests/bem-class-name.test.js`
- `stylelint-plugin-the-upper-room/tests/spacing-token-only.test.js`

Each suite has at least one positive (green) and one negative (must error) fixture.

### Playwright E2E
**Spec file:** `frontend/projects/the-upper-room/e2e/tests/foundation/lint-meta.spec.ts`

**Scenario:**
1. Run `npm run lint -- --max-warnings=0` via `child_process` from the spec; assert exit code 0 across the whole repo (regression net for these rules).

## Implementation Outline

- `tools/eslint-plugin-the-upper-room/` — TS-based ESLint plugin.
- `tools/stylelint-plugin-the-upper-room/` — JS Stylelint plugin.
- Register in root `.eslintrc`/`.stylelintrc.json`.

## Definition of Done

- [ ] All six rules have green + negative fixture tests passing.
- [ ] CI fails when a known-bad fixture is introduced.
- [ ] Existing code (from TASK-0001..0005) passes the rules.
