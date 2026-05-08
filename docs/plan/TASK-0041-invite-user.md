---
id: TASK-0041
title: Invite user dialog
status: Completed
phase: U
depends_on: [TASK-0040]
traces_to: [L2-027]
estimated_context: small
---

# TASK-0041: Invite user dialog

## Goal
"Invite user" opens a dialog with email/first/last/role/city/personal-message; on submit, server creates an `Invitation` and emails the link; success snackbar with "Undo" within 10s.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/users/invite-user.spec.ts`

**Page Object:** `components/InviteUserDialog.ts`.

**Scenarios:**
1. Submit valid invite → dialog closes; snackbar "Invitation sent to alice@example.com" with "Undo".
2. Click "Undo" within 10s → invitation revoked; secondary snackbar "Invitation revoked".
3. Duplicate email → 409 → email-field error "This email already has a pending invitation."; dialog stays open.
4. Email validation matches the L2-066 `validation.email` message.

### Backend
- `InviteUserCommandTests.cs` — duplicate detection; revoke window enforced server-side too.

## Definition of Done
- [ ] Undo deletes the invitation row.
