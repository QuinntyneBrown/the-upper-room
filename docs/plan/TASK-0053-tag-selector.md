---
id: TASK-0053
title: Reusable tag selector component
status: Accepted
phase: CI
depends_on: [TASK-0052]
traces_to: [L2-040]
estimated_context: small
---

# TASK-0053: Tag selector

## Goal
`<tar-tag-selector [(tags)]>` autocomplete with create-on-Enter behavior gated by `Tag:Create` permission.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/tags/tag-selector.spec.ts`

**Page Object:** `components/TagSelector.ts`.

**Scenarios:**
1. Typing "vi" surfaces "VIP" with its color dot.
2. As CityLead (has `Tag:Create`), typing a new tag name and pressing Enter creates it.
3. As Member (no `Tag:Create`), the "Press Enter to create" hint is hidden; only matches selectable.
4. Removing a chip emits `tagsChange`.

## Definition of Done
- [ ] Lives in `domain` library (depends on api).
