# BUG-029 — Delete confirmation input has wrong data-testid in test plan

| Field | Value |
|---|---|
| ID | BUG-029 |
| Severity | Low |
| Status | Open |
| Discovered | TC-6.13 |
| Component | `tar-confirm-dialog` / test plan doc |

## Description

The test plan for TC-6.13 specifies that the name-confirmation input inside the delete dialog uses `data-testid="delete-confirm-input"`. The actual `tar-confirm-dialog` component uses `data-testid="confirm-typed-input"` for this field. The feature works correctly; only the documented attribute name is wrong.

## Root Cause

The test plan was written using a projected attribute name that was not kept in sync with the implemented `tar-confirm-dialog` component's actual `data-testid`.

## Fix

Update `docs/test-plan/06-partners.md` TC-6.13 step 4 to reference `data-testid="confirm-typed-input"` instead of `data-testid="delete-confirm-input"`.
