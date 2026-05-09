---
id: TASK-TC-5.11
title: 'Run TC-5.11 - Edit contact updates name'
status: Completed
test_id: TC-5.11
source: ../../test-plan/05-contacts.md
---

# TASK-TC-5.11: Run TC-5.11 - Edit contact updates name

## Goal

Run `TC-5.11` from `docs/test-plan/05-contacts.md` and record the result.

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
| Result | **PASS** |
| Browser | Chromium (Playwright) |
| Viewport | 1280×720 |
| Build SHA | 51ae104 |
| Tester | Claude (automated) |
| Run at | 2026-05-09T17:49:00Z |

### Evidence

- Navigated to `/contacts/c1/edit` (Alice) ✅
- `data-testid="contact-first-name"` input present with value "Alice" ✅
- Filled first name with "Alicia", clicked Save ✅
- `PUT /api/v1/contacts/c1` returned 200 ✅
- Navigated back to `/contacts/c1` ✅
- `<h1>` shows "Alicia" ✅
- Page title updated to "Alicia · The Upper Room" ✅
