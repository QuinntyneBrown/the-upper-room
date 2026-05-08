---
id: TASK-0067
title: Contact archive / restore
status: Accepted
phase: C
depends_on: [TASK-0066]
traces_to: [L2-033]
estimated_context: small
---

# TASK-0067: Archive / restore

## Goal
Archive button on detail and from list row menu sets `archived=true` (excluded from default list). Restore from the Archived filter.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/contacts/contact-archive.spec.ts`

**Scenarios:**
1. Archive a contact → snackbar "Contact archived" with "Undo" → contact disappears from default list.
2. Toggle "Archived" filter → contact appears with subdued styling.
3. Click "Restore" → contact returns to default list.
