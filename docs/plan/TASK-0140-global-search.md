---
id: TASK-0140
title: Global search dialog + cross-resource backend endpoint
status: Draft
phase: S
depends_on: [TASK-0060, TASK-0070, TASK-0100, TASK-0110, TASK-0120]
traces_to: [L2-060, L2-077]
estimated_context: medium
---

# TASK-0140: Global search

## Goal
`Ctrl+K` / `Cmd+K` and the search icon open a centered dialog (`min(640px, 100vw - 32px)`, top-positioned `15vh`). Backend `GET /api/v1/search?q=` searches across Contacts, Partners, Events, Ideas, Locations and returns up to 5 per group.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/search/global-search.spec.ts`

**Page Object:** `components/GlobalSearchDialog.ts`.

**Scenarios:**
1. Press `Control+K` → dialog opens within 200ms; input is autofocused.
2. Type "alice" → after 300ms exactly one network call; results grouped.
3. ArrowDown 3 times + Enter → navigates to the third result.
4. No results → empty state with `search_off`, "No matches", "Try different keywords or check your filters.".
5. Esc closes dialog and returns focus to the trigger.
