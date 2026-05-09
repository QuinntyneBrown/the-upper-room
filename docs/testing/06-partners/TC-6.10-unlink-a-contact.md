---
id: TASK-TC-6.10
title: 'Run TC-6.10 - Unlink a contact'
status: Completed
test_id: TC-6.10
source: ../../test-plan/06-partners.md
---

# TASK-TC-6.10: Run TC-6.10 - Unlink a contact

## Goal

Run `TC-6.10` from `docs/test-plan/06-partners.md` and record the result.

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
| Build SHA | 3114dcc |
| Tester | Claude (automated) |
| Run at | 2026-05-09T18:34:30Z |

### Evidence

- Navigated to `/partners/p-seed` Contacts tab (with a linked contact from TC-6.9) ✅
- Unlink/remove button (×) visible beside linked contact ✅
- Clicked unlink button → `DELETE /api/v1/partners/p-seed/contacts/{contactId}` returned 204 ✅
- Contact removed from the tab list; contact entity remains in contacts data ✅
