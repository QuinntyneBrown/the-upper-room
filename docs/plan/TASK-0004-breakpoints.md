---
id: TASK-0004
title: Breakpoint mixins + responsive grid utility
status: Accepted
phase: F
depends_on: [TASK-0002]
traces_to: [L2-008, L2-014]
estimated_context: small
---

# TASK-0004: Breakpoint mixins + responsive grid utility

## Goal
Define the XS/SM/MD/LG/XL/XXL breakpoint Sass mixins (mobile-first; defaults are XS, larger sizes are min-width media queries) and a 12-column responsive grid utility class set. Verified by a styleguide block whose layout changes at each breakpoint.

## ATDD Process — REQUIRED
Write a Playwright test that resizes the viewport to 375 / 600 / 800 / 1100 / 1300 / 1500 px and asserts that the demo grid switches column counts at each step BEFORE writing any media queries.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/foundation/breakpoints.spec.ts`

**Page Object:** `StyleguidePage.gridDemo()`, `.cardCount()`.

**Scenarios:**
1. At viewport 375×800 px, the 12-card grid lays out 1 column.
2. At 600 px, 2 columns. At 800 px, 3 columns. At 1100 px, 4 columns. At 1300 px, 6 columns.
3. Resizing from 320 → 1920 produces no horizontal scrollbar at any width (`document.documentElement.scrollWidth <= clientWidth`).

## Implementation Outline

- `projects/components/src/lib/breakpoints/_mixins.scss` exporting `xs`, `sm`, `md`, `lg`, `xl`, `xxl` mixins.
- `_grid.scss` providing utility classes `.u-grid`, `.u-grid--{n}` and column-span utilities.
- Demo lives on `/styleguide#breakpoints`.

## Definition of Done

- [ ] All viewport scenarios green.
- [ ] No fixed-width pixel layouts in the grid utility.
- [ ] Trace comment present.

## Out of Scope
- App shell responsiveness (TASK-0005); feature pages (their own tasks).
