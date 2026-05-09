---
id: TASK-TC-5.12
title: 'Run TC-5.12 - Archive contact'
status: Completed
test_id: TC-5.12
source: ../../test-plan/05-contacts.md
---

# TASK-TC-5.12: Run TC-5.12 - Archive contact

## Goal

Run `TC-5.12` from `docs/test-plan/05-contacts.md` and record the result.

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
| Build SHA | 51ae104 |
| Tester | Claude (automated) |
| Run at | 2026-05-09T17:50:00Z |

### Evidence

- Clicked `data-testid="contact-archive-button"` on `/contacts/c1` ✅
- `PATCH /api/v1/contacts/c1` fired with body `{"archived":true}`, returned 200 ✅
- Response body: `{"id":"c1","name":"Alicia","cityId":"Toronto"}` — no `archived` field returned ❌
- Archive button did **not** flip to "Restore" — `data-testid="contact-restore-button"` absent ❌

### Root cause

The backend `PatchContactRequest` only accepts `name`. The `archived` field is silently ignored and not persisted. The 200 response omits `archived`, so the frontend's conditional rendering (`@if (!c.archived)`) keeps showing "Archive".

**Per test-plan TC-5.12:** *Current implementation does not persist archival. Mark blocked/failed against the product requirement.*
