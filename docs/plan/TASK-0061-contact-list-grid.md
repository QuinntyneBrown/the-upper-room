---
id: TASK-0061
title: Contact list responsive grid + filters/search
status: Draft
phase: C
depends_on: [TASK-0060, TASK-0053]
traces_to: [L2-030]
estimated_context: medium
---

# TASK-0061: Contact list grid

## Goal
Replace the empty-only state with a responsive card grid (XS 1col, MD 2col, LG 3col, XL 4col), tag/city/archived filter chips, debounced search, and a FAB on XS/SM (filled "New contact" button on MD+).

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/contacts/contact-list-grid.spec.ts`

**Page Object:** Extend `ContactsListPage` with `searchInput()`, `filterChip()`, `cardByName()`, `fab()`, `cardCountAtViewport()`.

**Scenarios:**
1. With 12 seeded contacts, at viewport 768px, exactly 2 columns of cards are rendered.
2. Each card shows avatar 48px, display name, title @ org, primary phone, primary email, ≤3 tag chips with "+N" overflow.
3. Search "bob" debounces 300ms → exactly one network call to `/contacts?search=bob`; results filter accordingly.
4. Toggle "Archived" filter chip → `?archived=true`; archived contacts appear with subdued styling.
5. FAB visible at XS, hidden at MD+; "New contact" button visible at MD+ in the toolbar.

## Definition of Done
- [ ] Search and filters preserved in URL query.
- [ ] No CLS during list load (skeleton matches card heights).
