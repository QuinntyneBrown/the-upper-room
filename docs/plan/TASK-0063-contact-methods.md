---
id: TASK-0063
title: Contact phones / emails / addresses sub-forms
status: Draft
phase: C
depends_on: [TASK-0062]
traces_to: [L2-029, L2-032]
estimated_context: medium
---

# TASK-0063: Contact methods

## Goal
Add the "Contact methods" group: 0..n phones (label + e164 + isPrimary), 0..n emails (label + address + isPrimary), 0..n addresses; "Add" buttons; remove icon; new-row focus management.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/contacts/contact-methods.spec.ts`

**Page Object:** Extend `ContactFormPage` with `addPhone()`, `addEmail()`, `addAddress()`, `phoneRow(index)`, `removePhone(index)`.

**Scenarios:**
1. Adding a phone moves focus to the new number input.
2. Invalid phone (`not-a-number`) shows L2-066 `validation.phone` message.
3. Two primary emails not allowed → save is rejected with form-level banner.
4. Removing the last phone is allowed (0..n).
5. Country in address autocomplete from `/api/v1/lookups/countries`.

### Backend
- E.164 validation via libphonenumber-csharp; address validated lightly (no postal lookup).

## Definition of Done
- [ ] Click-to-call `tel:` and click-to-mail `mailto:` work on detail page (L2-031).
