---
id: TASK-0068
title: Contact delete (typed confirmation, soft delete, 30-day purge)
status: Completed
phase: C
depends_on: [TASK-0066, TASK-0009]
traces_to: [L2-033]
estimated_context: small
---

# TASK-0068: Contact delete

## Goal
Delete confirms via the danger dialog requiring typed confirmation of the display name; soft-deletes immediately (PII redaction); a daily background job removes rows after 30 days.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/contacts/contact-delete.spec.ts`

**Scenarios:**
1. Delete "Alice Smith" → confirm dialog requires typing exactly "Alice Smith"; "alice smith" leaves button disabled.
2. Confirm → snackbar "Contact deleted"; contact removed from list; `GET /contacts/{id}` returns 404.
3. Direct DB inspection (test helper) shows `deletedAt` set and PII fields redacted.

### Backend
- Background job test: row created with `deletedAt` 31 days ago is purged; rows < 30d remain.

## Definition of Done
- [ ] Audit row created.
