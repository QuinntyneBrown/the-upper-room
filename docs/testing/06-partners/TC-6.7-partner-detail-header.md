---
id: TASK-TC-6.7
title: 'Run TC-6.7 - Partner detail header'
status: Completed
test_id: TC-6.7
source: ../../test-plan/06-partners.md
---

# TASK-TC-6.7: Run TC-6.7 - Partner detail header

## Goal

Run `TC-6.7` from `docs/test-plan/06-partners.md` and record the result.

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
| Run at | 2026-05-09T18:33:00Z |
| Defect | BUG-028 (fixed before retest) |

### Evidence

- Clicked `data-testid="partner-card-Grace Church"` → navigated to `/partners/p-seed` ✅
- `data-testid="partner-detail-header"` present ✅
- `data-testid="partner-letter-avatar"` with text "G" (no logo) ✅
- `data-testid="partner-detail-name"` text "Grace Church" ✅
- `data-testid="partner-edit-button"` (`btn-outlined`) visible ✅
- `data-testid="partner-archive-button"` visible ✅
- `data-testid="partner-delete-button"` (`btn-danger`) visible ✅
- Tab bar with Overview, Contacts, Activity tabs rendered ✅

### Note

BUG-028 was discovered during initial run: partner cards were plain `<div>` elements with no `routerLink`, making navigation impossible. Fixed by converting to `<a [routerLink]="['/partners', partner.id]">`. Retest passed.
