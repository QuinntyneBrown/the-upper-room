---
id: TASK-0002
title: M3 design tokens — color, typography, spacing, elevation, shape, motion
status: Accepted
phase: F
depends_on: [TASK-0001]
traces_to: [L2-001, L2-002, L2-003, L2-004, L2-005, L2-006]
estimated_context: medium
---

# TASK-0002: M3 design tokens

## Goal
Establish the M3 token system (color roles, type scale, 4dp spacing, elevation, shape, motion) as SCSS variables/mixins and CSS custom properties, with both light and dark themes generated from seed `#6750A4`. Land the tokens in the `components` library so they can be consumed by every other library and the app. The vertical slice: a `/styleguide` route in dev that renders one button, one card, and one chip whose computed styles match the token spec exactly.

## ATDD Process — REQUIRED
Write the Playwright spec asserting computed styles BEFORE writing any token. Watch it fail. Author tokens minimally to flip green.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/foundation/design-tokens.spec.ts`

**Page Object:** `pages/StyleguidePage.ts` exposing `seedButton()`, `seedCard()`, `seedChip()`.

**Scenarios (each Given/When/Then asserting `getComputedStyle`):**
1. Button uses `border-radius: 9999px` (L2-005).
2. Card uses `border-radius: 12px` (L2-005), padding `16px` at XS, `24px` at MD+ (L2-003).
3. Body text on the page resolves to `font-family: 'Roboto', ...` and `body-medium` size `14px` line-height `20px` (L2-002).
4. The CSS variable `--md-sys-color-primary` resolves to a non-empty hex on `:root`, and its dark equivalent on `[data-theme=dark]`.
5. With `prefers-reduced-motion: reduce` emulated, a hover transition's `transition-duration` is `0ms` (L2-006).

### Unit (frontend)

- `tokens.spec.ts` — verifies the SCSS mixin map keys (`space-1..space-24`, type scale slots, elevation level0..level5).

## Implementation Outline

- `projects/components/src/lib/tokens/_color.scss`, `_type.scss`, `_space.scss`, `_elevation.scss`, `_shape.scss`, `_motion.scss`, `_index.scss`.
- Use `@angular/material` v17+ `mat.define-theme()` API for color roles; export as both Sass map AND `:root` CSS custom properties.
- Stylelint plugin `the-upper-room/spacing-token-only` (skeleton; full enforcement in TASK-0006).
- Dev-only route `/styleguide` (lazy, behind `if (!environment.production)`).

## Definition of Done

- [ ] All scenarios green in both themes (light + dark) using `colorScheme` Playwright option.
- [ ] No literal `px` for margin/padding outside the spacing tokens.
- [ ] L2-001..L2-006 acceptance criteria all pass against rendered DOM.
- [ ] `// Traces to:` comment present on every test file.

## Out of Scope
- Iconography (TASK-0003), breakpoints (TASK-0004), full styleguide content.
