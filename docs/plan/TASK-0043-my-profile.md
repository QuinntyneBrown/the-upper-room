---
id: TASK-0043
title: My Profile page
status: Accepted
phase: U
depends_on: [TASK-0021]
traces_to: [L2-107]
estimated_context: small
---

# TASK-0043: My Profile

## Goal
Route `/profile` with avatar uploader (TASK-0044), basic fields (first/last/display/pronouns/title), city (read-only for non-admin), timezone, locale, plus a "Security" subsection for Change password and "Sign out other sessions" (TASK-0045).

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/users/profile.spec.ts`

**Page Object:** `pages/MyProfilePage.ts`.

**Scenarios:**
1. Editing display name + saving → snackbar "Profile updated"; reload preserves the change.
2. Cancel returns to original values without persisting.
3. Member cannot edit city.

## Definition of Done
- [ ] Form is dirty-aware (Save disabled until something changed).
