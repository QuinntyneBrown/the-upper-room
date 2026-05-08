---
id: TASK-0130
title: Dashboard page
status: Draft
phase: H
depends_on: [TASK-0060, TASK-0070, TASK-0100, TASK-0120, TASK-0090]
traces_to: [L2-059]
estimated_context: medium
---

# TASK-0130: Dashboard

## Goal
`/dashboard` with welcome header, 4 stat cards (Contacts, Partners, Upcoming Events, Open Ideas), Upcoming events, Recent activity, My ideas, Tasks on my boards. Responsive grid (XS 2x2 stats; LG+ 12-col layout per L2-059).

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/dashboard/dashboard.spec.ts`

**Page Object:** `pages/DashboardPage.ts`.

**Scenarios:**
1. After sign-in, default landing is `/dashboard` with welcome "Welcome, {firstName}".
2. Stat cards show counts matching seeded data.
3. At XS, stats arrange 2×2; at LG+, 4×1.
4. Upcoming events widget shows next 5; "View calendar" link.
5. "Tasks on my boards" groups assigned cards by board.

## Definition of Done
- [ ] Each widget has its own loading skeleton + error state.
