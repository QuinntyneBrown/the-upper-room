---
id: TASK-0040
title: User list page (admin)
status: Draft
phase: U
depends_on: [TASK-0031, TASK-0032]
traces_to: [L2-026]
estimated_context: medium
---

# TASK-0040: User list (admin)

## Goal
Implement `/admin/users` with the table layout from L2-026: avatar, name, email, role chip, city, status chip, last sign-in, actions; debounced search; filter chips; pagination 25/50/100; "Invite user" button (dialog wired in TASK-0041).

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/users/user-list.spec.ts`

**Page Object:** `pages/UserListPage.ts` (`searchInput()`, `filterChip(name)`, `row(email)`, `paginator()`, `inviteButton()`).

**Scenarios:**
1. Renders table headers and at least one seeded admin row.
2. Typing "alice" in search → after 300ms exactly one network call to `/api/v1/users?search=alice`.
3. Filtering by Role=Member shows only Members.
4. Empty state (search no-match) shows icon `group_off`, heading "No users found".
5. Pagination: page-size 50 → URL query `?page=1&pageSize=50`.
6. Member visiting `/admin/users` is redirected to `/forbidden`.

## Definition of Done
- [ ] All scenarios pass; matrix tested as Member and SystemAdmin.
