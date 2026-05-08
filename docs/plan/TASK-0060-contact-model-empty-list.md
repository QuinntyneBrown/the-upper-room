---
id: TASK-0060
title: Contact data model + minimal API + empty list page
status: Accepted
phase: C
depends_on: [TASK-0033, TASK-0010]
traces_to: [L2-029, L2-030, L2-077]
estimated_context: medium
---

# TASK-0060: Contact backbone

## Goal
Persist the Contact entity with all required fields (L2-029), expose `GET /api/v1/contacts` and `GET /api/v1/contacts/{id}`, and render the empty list state at `/contacts`. Filters/search/grid come in TASK-0061; create form in TASK-0062.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/contacts/contact-empty-state.spec.ts`

**Page Object:** `pages/ContactsListPage.ts` (`emptyState()`, `emptyStateActionButton()`).

**Scenarios:**
1. As CityLead in a city with zero contacts, `/contacts` shows the empty state: icon `person_add`, heading "No contacts yet", body "Add your first contact to get started.", "New contact" filled button.
2. Empty state passes axe-core a11y check.
3. Member visiting `/contacts` sees the same empty state but no "New contact" button (no `Contact:Create`).

### Backend
- Migration creates `Contacts`, `ContactPhones`, `ContactEmails`, `ContactAddresses`, `EntityTags` tables with the columns listed in L2-029.
- `GetContactsQueryTests.cs` — city-scoped; returns paged envelope; respects soft-delete.

## Definition of Done
- [ ] Contact tables match L2-078 column types and indexes.
