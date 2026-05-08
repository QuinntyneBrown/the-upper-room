---
id: TASK-0151
title: Notification bell + inbox menu
status: Draft
phase: No
depends_on: [TASK-0150, TASK-0005]
traces_to: [L2-062]
estimated_context: small
---

# TASK-0151: Notification bell

## Goal
Bell icon in top bar with badge (unread count, max "99+"); click opens 400px menu (full width on XS) titled "Notifications" with Unread/All tabs; rows show severity-colored icon, title, 2-line preview, relative time. Footer "Mark all as read" + "Notification settings".

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/notifications/notification-bell.spec.ts`

**Page Object:** `components/NotificationBell.ts`.

**Scenarios:**
1. With 0 unread, bell has no badge; opening menu shows empty state ("notifications_off", "You're all caught up").
2. Dispatch a notification → badge increments to 1; menu lists row.
3. Click row → marks read, badge decrements, navigates to deep link.
4. "Mark all as read" → badge to 0; rows still listed under "All" tab.
