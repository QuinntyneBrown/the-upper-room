---
id: TASK-0071
title: Partner create form
status: Draft
phase: P
depends_on: [TASK-0070]
traces_to: [L2-037]
estimated_context: small
---

# TASK-0071: Partner create

## Goal
`/partners/new` form with sections "Basic info", "Contact methods", "Addresses", "Social", "Linked contacts", "Tags & Notes". Website field validates `^https?://` with a "Visit" trailing icon button when valid.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/partners/partner-create.spec.ts`

**Page Object:** `pages/PartnerFormPage.ts`.

**Scenarios:**
1. Submit with valid name and website → redirect to detail.
2. Website `example.com` → field error "Website must start with http:// or https://".
3. Duplicate name → 409 from L2-034.
4. Cancel with dirty form → discard dialog (reuses TASK-0009).
