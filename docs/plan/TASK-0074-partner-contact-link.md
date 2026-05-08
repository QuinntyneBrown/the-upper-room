---
id: TASK-0074
title: Partner ↔ Contact link with role on link
status: Draft
phase: P
depends_on: [TASK-0072, TASK-0065]
traces_to: [L2-036]
estimated_context: small
---

# TASK-0074: Partner contacts tab

## Goal
On the partner detail Contacts tab, list linked contacts in a table; "Link contact" opens a search dialog to assign a role (e.g., "Primary Contact"); unlink removes only the link.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/partners/partner-contact-link.spec.ts`

**Page Object:** `components/LinkContactDialog.ts`, `components/PartnerContactsTab.ts`.

**Scenarios:**
1. Link a contact with role "Primary Contact" → row appears in table; click navigates to contact detail.
2. Unlink → confirmation; snackbar "Contact unlinked from {partner}" with Undo; contact entity remains.
3. Linking the same contact twice → 409 with friendly message.
