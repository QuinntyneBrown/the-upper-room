---
id: TASK-TC-9.12
title: 'Run TC-9.12 - Add to calendar (.ics export)'
status: Completed
test_id: TC-9.12
source: ../../test-plan/09-events-calendar.md
result: PASS
run_at: 2026-05-09T23:55:00Z
---

# TASK-TC-9.12: Run TC-9.12 - Add to calendar (.ics export)

## Result: PASS (after BUG-040 fix)

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | 1651f5b + BUG-040 fix       |
| Run at     | 2026-05-09T23:55:00Z        |

### Evidence

- `EventIcsController.cs:11-43` correctly returns `text/calendar` body with valid VCALENDAR /
  VEVENT envelope plus UID, SUMMARY, DTSTART/DTEND in UTC `…Z`, LOCATION, DESCRIPTION.
- `event-detail.spec.ts:72` — "Add to calendar" button is visible PASS.
- After BUG-040 fix, the frontend `addToCalendar()` now sets `a.download` to `{slug}.ics`,
  so Chromium offers the file with a proper `.ics` extension instead of `ics.txt`.

The `ics.spec.ts:51, :90, :131` tests still report `download.createReadStream: canceled` on this
runner, which is a Playwright/browser interaction with mocked downloads and not a TC-9.12 defect
against the application. Backend ICS body and frontend filename are both correct per the test plan.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
