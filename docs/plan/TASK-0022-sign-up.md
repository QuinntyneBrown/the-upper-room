---
id: TASK-0022
title: Sign-up page + invitation acceptance
status: Draft
phase: A
depends_on: [TASK-0021]
traces_to: [L2-017]
estimated_context: medium
---

# TASK-0022: Sign-up + invitation

## Goal
Public sign-up at `/sign-up` and invitation-bound sign-up at `/invitations/accept?token=...` (auto-fills email and city, locks them).

## ATDD Process — REQUIRED

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/auth/sign-up.spec.ts`

**Page Object:** `pages/SignUpPage.ts`.

**Scenarios:**
1. **Happy path** — Fill required fields with valid data; submit; redirect to `/verify-email`; success snackbar "Account created! Check your email to verify." for 5000ms.
2. **Duplicate email** — API 409; field error "An account with this email already exists. Try signing in." with inline "Sign in" link to `/sign-in`.
3. **Disabled submit** — Submit button is disabled until all required fields are valid AND terms checkbox is checked.
4. **Invitation flow** — Visiting `/invitations/accept?token=valid` pre-fills email + city as read-only; on submit the user is associated to the invited city.
5. **Expired invitation** — `token=expired`: page shows error card "This invitation has expired." with "Request a new invite" CTA.

### Backend Integration
- `Invitations/AcceptInvitationCommandTests.cs` — token TTL 7 days; one-time use.

## Definition of Done
- [ ] Snackbar copy matches L2-063 `welcome` template.
