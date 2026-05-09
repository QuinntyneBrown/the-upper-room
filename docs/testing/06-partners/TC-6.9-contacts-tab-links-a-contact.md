---
id: TASK-TC-6.9
title: 'Run TC-6.9 - Contacts tab links a contact'
status: Completed
test_id: TC-6.9
source: ../../test-plan/06-partners.md
---

# TASK-TC-6.9: Run TC-6.9 - Contacts tab links a contact

## Goal

Run `TC-6.9` from `docs/test-plan/06-partners.md` and record the result.

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
| Run at | 2026-05-09T18:34:00Z |

### Evidence

- Navigated to `/partners/p-seed`, clicked Contacts tab ✅
- Clicked "Link contact" button ✅
- Dialog heading "Link contact" visible ✅
- `data-testid="link-contact-search"` (label "Search contacts", placeholder "Type a name…") present ✅
- `data-testid="link-contact-confirm"` (Link button) disabled until contact selected ✅
- Typed contact name fragment; result list items with `data-testid="link-contact-result-{name}"` appeared ✅
- Selected a result, filled `data-testid="link-contact-role"` with "Primary Contact" ✅
- Clicked `data-testid="link-contact-confirm"` → `POST /api/v1/partners/p-seed/contacts` returned 201 ✅
- Dialog closed; linked contact appeared in Contacts tab ✅
