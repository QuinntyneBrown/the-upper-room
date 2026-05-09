---
id: TASK-0070
title: Partner data model + API + list page
status: Done
phase: P
depends_on: [TASK-0033, TASK-0010]
traces_to: [L2-034, L2-035, L2-077]
estimated_context: medium
---

# TASK-0070: Partner backbone

## Goal
Persist Partner with all L2-034 fields, expose CRUD endpoints, and render `/partners` with the same responsive grid pattern as contacts. Empty state with icon `domain_disabled` and copy from L2-035.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/partners/partner-list.spec.ts`

**Page Object:** `pages/PartnersListPage.ts`.

**Scenarios:**
1. Empty state at `/partners` with the prescribed copy and "New partner" button.
2. With seeded partners, cards show logo (or first-letter fallback on tertiary container background) plus name, website, contact count, tags.
3. Filter by Tag/City/Archived behaves identical to TASK-0061.

### Backend
- Tables `Partners`, `PartnerPhones`, `PartnerEmails`, `PartnerAddresses`, `PartnerSocialLinks`, `PartnerContacts`.
- Unique-name-within-city validator returns 409 with the exact L2-034 error.
