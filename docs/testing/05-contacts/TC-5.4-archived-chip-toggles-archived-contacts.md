---
id: TASK-TC-5.4
title: 'Run TC-5.4 - Archived chip toggles archived contacts'
status: Completed
test_id: TC-5.4
source: ../../test-plan/05-contacts.md
---

# TASK-TC-5.4: Run TC-5.4 - Archived chip toggles archived contacts

## Goal

Run `TC-5.4` from `docs/test-plan/05-contacts.md` and record the result.

## Execution

- Follow the source test case steps, verification notes, pass criteria, and severity.
- Capture browser, viewport, build SHA, result, tester, run timestamp, and defect link if the result fails.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.

## Result

| Field | Value |
|---|---|
| Result | **FAIL — BLOCKED** |
| Browser | Chromium (Playwright) |
| Viewport | 1280×720 |
| Build SHA | 4b4097e |
| Tester | Claude (automated) |
| Run at | 2026-05-09T17:54:00Z |

### Evidence

- Clicked `data-testid="contacts-filter-archived"` chip ✅
- Chip gained `filter-chip--active` class ✅
- `GET /api/v1/contacts?archived=true` issued ✅
- Backend ignores `archived` query param — no archived contacts returned, no cards show `contact-card--archived` styling ❌

**Per test-plan TC-5.4:** *Current backend ContactRow has only Id, Name, and CityId. GET /api/v1/contacts?archived=true is currently ignored by the backend query. Mark blocked/failed against the product requirement.*
