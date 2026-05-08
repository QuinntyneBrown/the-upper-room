---
id: TASK-0066
title: Contact edit form
status: Accepted
phase: C
depends_on: [TASK-0062]
traces_to: [L2-032]
estimated_context: small
---

# TASK-0066: Contact edit

## Goal
`/contacts/:id/edit` reuses the create form pre-populated; `PUT /api/v1/contacts/{id}` updates with optimistic concurrency (rowversion).

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/contacts/contact-edit.spec.ts`

**Page Object:** `pages/ContactFormPage.ts` (already exists).

**Scenarios:**
1. Editing first name + saving → detail page reflects new name; success snackbar.
2. Concurrent edit (stub server returns 409 conflict) → form-level banner "This contact was modified elsewhere. Reload to see latest." with "Reload" button.

## Definition of Done
- [ ] Server enforces optimistic concurrency.
