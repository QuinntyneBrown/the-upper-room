---
id: TASK-0154
title: Push channel via PWA service worker
status: Draft
phase: No
depends_on: [TASK-0150, TASK-0173]
traces_to: [L2-063]
estimated_context: medium
---

# TASK-0154: Push channel

## Goal
Web Push via VAPID. User opts in from `/settings/notifications`; subscription persisted server-side; push messages dispatched in addition to in-app.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/notifications/push.spec.ts`

**Scenarios:**
1. Click "Enable push" → browser permission prompt mocked accept → subscription POST'd to server.
2. Dispatch `event_starting_soon` → service worker `push` event fires; notification displayed by SW.
3. Click "Disable push" → subscription removed.

## Definition of Done
- [ ] Push subscription stored encrypted at rest.
