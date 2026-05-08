---
id: TASK-0027
title: Session inactivity timeout dialog
status: Completed
phase: A
depends_on: [TASK-0021]
traces_to: [L2-022]
estimated_context: small
---

# TASK-0027: Inactivity timeout

## Goal
After 30 minutes of zero user input, show "Are you still there?" dialog with a 60-second countdown → auto sign-out at zero.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/auth/inactivity.spec.ts`

**Page Object:** `components/InactivityDialog.ts`.

**Scenarios (using `page.clock.install()` and `clock.fastForward()`):**
1. After 30 min of no input, dialog appears titled "Are you still there?" with countdown starting at 60.
2. Clicking "Stay signed in" closes the dialog and silently refreshes the access token.
3. Without interaction, after another 60s the user is signed out and redirected to `/sign-in`.
4. Mouse movement in the last 30 min defers the dialog by another full window.

## Implementation Outline
- `idle.service.ts` listening to `mousemove`, `keydown`, `pointerdown`, `focus` and emitting "idle" after 30 min of silence.

## Definition of Done
- [ ] No false positive when user is actively typing.
