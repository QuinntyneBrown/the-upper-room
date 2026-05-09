---
id: TASK-0126
title: ICS download
status: Done
phase: E
depends_on: [TASK-0123]
traces_to: [L2-055]
estimated_context: small
---

# TASK-0126: ICS export

## Goal
"Add to calendar" downloads a single-event `.ics` file from `GET /api/v1/events/{id}/ics` with proper VCALENDAR/VEVENT envelope.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/events/ics.spec.ts`

**Scenarios:**
1. Click "Add to calendar" → download contains `BEGIN:VCALENDAR` ... `END:VCALENDAR` with `SUMMARY`, `DTSTART`, `DTEND`, `LOCATION`, `DESCRIPTION`, `UID`.
2. UID is stable across downloads (same UUID).
3. DTSTART/DTEND are UTC with `Z` suffix.

## Definition of Done
- [ ] Verified to import cleanly into Google Calendar (manual smoke).
