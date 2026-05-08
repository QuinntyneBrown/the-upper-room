---
id: TASK-0052
title: Tag CRUD page (admin)
status: Accepted
phase: CI
depends_on: [TASK-0030]
traces_to: [L2-038, L2-039]
estimated_context: small
---

# TASK-0052: Tag CRUD

## Goal
`/admin/tags` shows tag chips grouped by color, usage counts per resource, and supports create/edit/delete.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/tags/tag-crud.spec.ts`

**Page Object:** `pages/TagsPage.ts`.

**Scenarios:**
1. Create tag "VIP" with color "purple" → chip appears in the Purple group.
2. Duplicate name (case-insensitive) → 409 with `validation.duplicate`.
3. Edit color → all entities tagged update on next render.
4. Delete tag → confirmation; m..n associations removed; entities remain.

## Definition of Done
- [ ] 12 colors selectable; chip renders the M3 chip color.
