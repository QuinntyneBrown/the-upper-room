---
id: TASK-0008
title: Snackbar service with severity tokens
status: Accepted
phase: F
depends_on: [TASK-0002]
traces_to: [L2-061]
estimated_context: small
---

# TASK-0008: Snackbar service

## Goal
Implement the `<tar-snackbar>` host + `SnackbarService` providing `info|success|warning|error` severities with the durations, colors, position, and action-button rules from L2-061.

## ATDD Process — REQUIRED

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/foundation/snackbar.spec.ts`

**Page Object:** `components/Snackbar.ts` (`message()`, `actionButton()`, `dismiss()`); `pages/StyleguidePage.snackbarDemo()`.

**Scenarios:**
1. Info snackbar auto-dismisses after `4000ms`; success after `5000ms`; warning after `7000ms`; error stays sticky past `10000ms`.
2. Hovering an info snackbar pauses dismiss; mouse-leave resumes.
3. At XS (375px) the snackbar appears bottom-center; at MD+ bottom-left, offset `24px` from edges.
4. Two queued snackbars play sequentially, never overlap.
5. Action button "Undo" click invokes the handler and dismisses immediately.
6. Error snackbar carries `role="alert"`; info carries `role="status"`.

## Implementation Outline

- `projects/components/src/lib/snackbar/`.
- Wrap `MatSnackBar` with severity-aware config.
- Manage queue via internal Subject; max 1 visible.

## Definition of Done

- [ ] All scenarios pass.
- [ ] Severity styling resolves to the L2-061 token colors.
