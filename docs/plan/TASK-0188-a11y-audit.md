---
id: TASK-0188
title: Accessibility audit (axe-playwright + manual keyboard)
status: Draft
phase: Z
depends_on: [TASK-0005]
traces_to: [L2-085, L2-086, L2-087, L2-088]
estimated_context: small
---

# TASK-0188: A11y audit

## Goal
Run `axe-playwright` against every key page; assert zero serious/critical violations. Tab-order test runs through every page's focus chain. Skip-to-content link is the first focusable element on every page.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/hardening/a11y.spec.ts`

**Page Object:** test helper `runA11y(page)`.

**Scenarios:**
1. For each of: `/sign-in`, `/dashboard`, `/contacts`, `/contacts/new`, `/contacts/:id`, `/partners`, `/boards`, `/boards/:id`, `/ideas`, `/events`, `/locations`, `/profile`, `/admin/users` — `axe.analyze()` returns zero serious/critical.
2. Tab from fresh page focuses skip-to-content first; activating it lands focus on `<main>`.
3. Dialog focus traps verified for confirm-dialog (Esc closes, Tab wraps).

## Definition of Done
- [ ] All scenarios green; PR template requires running audit locally.
