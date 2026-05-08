---
id: TASK-0009
title: Confirmation dialog service (info, warning, danger, typed-confirmation)
status: Accepted
phase: F
depends_on: [TASK-0002]
traces_to: [L2-099]
estimated_context: small
---

# TASK-0009: Confirmation dialog service

## Goal
Reusable `<tar-confirm-dialog>` invoked via `ConfirmService.confirm({...})`, supporting severity (info/warning/danger), optional `requireTypedConfirmation` (case-sensitive match), keyboard escape & focus trap.

## ATDD Process — REQUIRED

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/foundation/confirm-dialog.spec.ts`

**Page Object:** `components/ConfirmDialog.ts` (`title()`, `body()`, `confirmButton()`, `cancelButton()`, `typedInput()`).

**Scenarios:**
1. Info severity — confirm button is the filled primary; clicking it resolves the promise with `true`.
2. Warning — confirm has tertiary background and `warning` leading icon.
3. Danger with typed confirmation `DELETE` — confirm disabled until exact case-sensitive match; "delete" lowercase keeps it disabled, "DELETE" enables it.
4. Pressing Escape resolves the promise with `false` and closes the dialog.
5. Tab from confirm wraps to cancel (focus trap); first focus is on the cancel button.

## Implementation Outline
- `projects/components/src/lib/confirm-dialog/` (3 files + service file).
- Use `MatDialog`; configure focus trap and `disableClose: false` for non-danger, `true` for danger until input matches.

## Definition of Done
- [ ] All scenarios green.
- [ ] Escape close behavior matches every severity.
