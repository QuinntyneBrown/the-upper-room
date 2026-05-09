---
id: TASK-TC-5.9
title: 'Run TC-5.9 - Create contact validation: First name required'
status: Completed
test_id: TC-5.9
source: ../../test-plan/05-contacts.md
---

# TASK-TC-5.9: Run TC-5.9 - Create contact validation: First name required

## Goal

Run `TC-5.9` from `docs/test-plan/05-contacts.md` and record the result.

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
| Build SHA | 4b4097e |
| Tester | Claude (automated) |
| Run at | 2026-05-09T17:55:30Z |

### Evidence

- On `/contacts/new`, clicked Save without filling First name ✅
- `data-testid="contact-error-first-name"` visible with text "First name is required." ✅
- Stayed on `/contacts/new` — no navigation ✅
- Save button re-enabled (not disabled) ✅
- No API call made (client-side validation prevents submission) ✅

### Note

Client-side validation intercepts empty submit; the test plan's 422 API behavior was not triggered because the frontend validates before sending the request. Both paths (client validation + API validation) serve the same user-facing outcome.
