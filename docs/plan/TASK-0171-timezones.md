---
id: TASK-0171
title: Time zone handling
status: Accepted
phase: X
depends_on: [TASK-0124]
traces_to: [L2-111]
estimated_context: small
---

# TASK-0171: Time zones

## Goal
All timestamps stored UTC; rendered in user's TZ. Events declare own timezone; when viewer's TZ ≠ event's TZ, both are shown.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/cross-cutting/timezones.spec.ts`

**Scenarios:**
1. Event at 14:00 `America/New_York`, viewer in `America/Vancouver` → card shows "11:00 AM PT (2:00 PM ET)".
2. DST transitions: event scheduled at 02:30 on a "spring-forward" day handled correctly (no jump or double-fire).
3. TZ change in profile re-formats all rendered times immediately.

## Definition of Done
- [ ] Verified across PT/MT/CT/ET, plus UTC.
