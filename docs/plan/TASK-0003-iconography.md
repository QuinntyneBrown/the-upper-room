---
id: TASK-0003
title: Iconography registry (Material Symbols Rounded)
status: Draft
phase: F
depends_on: [TASK-0002]
traces_to: [L2-007]
estimated_context: small
---

# TASK-0003: Iconography registry

## Goal
Load Material Symbols Rounded (variable font, weight 400, fill 0, grade 0, optical 24), register the canonical icon name → semantic alias map (e.g. `tar:contacts → person`, `tar:partners → domain`, etc.), and provide a `<tar-icon name="contacts" size="md">` component (in `components` library) that resolves aliases.

## ATDD Process — REQUIRED
Write the test demanding `<tar-icon name="contacts">` renders the `person` glyph and `font-size: 24px` BEFORE adding the component.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/foundation/icons.spec.ts`

**Page Object:** Extend `StyleguidePage` with `iconByAlias(alias: string)` returning Locator.

**Scenarios:**
1. `tar:contacts` icon's text content is `person`, computed `font-family` includes `Material Symbols Rounded`.
2. `size="lg"` resolves to `font-size: 32px`; `size` defaults to `md` (24px).
3. With the icon font blocked via Playwright route mock, the icon's accessible label remains correct (icon name visible as fallback).

### Unit (frontend)
- `tar-icon.component.spec.ts` — alias map covers all aliases listed in L2-007.

## Implementation Outline

- `projects/components/src/lib/icon/` (3 files).
- Icon font loaded via `index.html` `<link>` tag using `font-display: swap`.
- Alias map exported as `ICON_ALIASES` constant; values are the literal Material Symbol names from L2-007.

## Definition of Done

- [ ] All L2-007 listed aliases tested.
- [ ] Spec uses POM only — no raw locators.
- [ ] Storybook/styleguide gallery row added.

## Out of Scope
- App-shell icon usage (TASK-0005); feature-specific icons (each feature task).
