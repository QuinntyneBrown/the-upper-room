---
id: TASK-0065
title: Contact detail Overview tab
status: Accepted
phase: C
depends_on: [TASK-0062]
traces_to: [L2-031]
estimated_context: small
---

# TASK-0065: Contact detail — Overview

## Goal
`/contacts/:id` shows header (avatar 96px, name, title @ org, action row) and Overview tab (left contact-info card, right tags + linked partners cards on MD+; stacked at XS).

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/contacts/contact-detail.spec.ts`

**Page Object:** `pages/ContactDetailPage.ts` (`header()`, `editButton()`, `archiveButton()`, `phones()`, `emails()`, `tags()`, `linkedPartners()`).

**Scenarios:**
1. Three phones render with their labels; clicking one navigates to `tel:` href.
2. Two emails render with `mailto:` href.
3. At XS, cards stack vertically with `12px` gap.
4. At MD+, two-column layout (2fr left / 1fr right).
5. Tabs are "Overview", "Notes", "Activity" (Notes/Activity placeholder until TASK-0081).

## Definition of Done
- [ ] Page title is `{displayName} · The Upper Room`.
