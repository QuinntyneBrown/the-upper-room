---
id: TASK-0062
title: Contact create form (basic info only)
status: Accepted
phase: C
depends_on: [TASK-0060]
traces_to: [L2-032, L2-029]
estimated_context: medium
---

# TASK-0062: Contact create — basics

## Goal
`/contacts/new` form with First Name, Last Name, Pronouns, Title, Organization, Display Name override; sticky save bar; cancel guard; redirect to detail on success. Phones/emails/addresses are deferred to TASK-0063.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/contacts/contact-create-basic.spec.ts`

**Page Object:** `pages/ContactFormPage.ts` (`firstName()`, `lastName()`, `submit()`, `cancel()`, `unsavedDot()`).

**Scenarios:**
1. Submit "Alice" "Smith" → redirect to `/contacts/{id}`; success snackbar "Contact created".
2. Empty firstName → field error "First name is required."; focus moves to firstName.
3. Cancel with dirty form → "Discard changes?" dialog with "Keep editing" / "Discard".
4. The unsaved indicator dot appears once any field changes.
5. Member without `Contact:Create` is redirected to `/forbidden`.

### Backend
- `CreateContactCommandValidator` enforces all L2-029 client-side rules server-side.

## Definition of Done
- [ ] City auto-set from current city scope; Member can't override.
