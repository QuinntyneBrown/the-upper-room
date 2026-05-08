---
id: TASK-0064
title: Contact tag assignment
status: Completed
phase: C
depends_on: [TASK-0062, TASK-0053]
traces_to: [L2-029]
estimated_context: small
---

# TASK-0064: Contact tags

## Goal
Add the tag selector (TASK-0053) to the contact form's "Tags & Notes" section, persisted via `EntityTags`.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/contacts/contact-tags.spec.ts`

**Page Object:** Extend `ContactFormPage` with `tagSelector()` returning `TagSelector` POM.

**Scenarios:**
1. Add tags "VIP" and "Sponsor" → save → detail page shows both chips with their colors.
2. Removing a tag in edit form, save → chip is gone; tag entity itself is not deleted.

## Definition of Done
- [ ] List page filter "Tag=VIP" filters correctly after assignment.
