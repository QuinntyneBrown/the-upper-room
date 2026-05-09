---
id: TASK-TC-6.5
title: 'Run TC-6.5 - Create partner'
status: Completed
test_id: TC-6.5
source: ../../test-plan/06-partners.md
---

# TASK-TC-6.5: Run TC-6.5 - Create partner

## Goal

Run `TC-6.5` from `docs/test-plan/06-partners.md` and record the result.

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
| Run at | 2026-05-09T18:32:00Z |
| Defect | BUG-027 (fixed before retest) |

### Evidence

- Clicked `data-testid="partners-new-button"` → navigated to `/partners/new` ✅
- Save bar heading "New Partner" visible ✅
- `data-testid="partner-name"` with label "Name *" present ✅
- `data-testid="partner-website"` with placeholder "https://example.org" present ✅
- Filled Name = "Acme Inc", Website = "https://acme.example" ✅
- `data-testid="partner-visit-link"` appeared with `open_in_new` icon after valid URL entered ✅
- Clicked Save → `POST /api/v1/partners` returned 201 ✅
- Navigated to `/partners/{id}` for the new partner ✅

### Note

BUG-027 was discovered during initial run: the "New partner" button was a plain `<button>` with no `routerLink`. Fixed by converting to `<a routerLink="/partners/new">`. Retest passed.
