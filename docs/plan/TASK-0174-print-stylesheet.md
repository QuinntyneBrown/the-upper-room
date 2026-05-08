---
id: TASK-0174
title: Print stylesheet
status: Draft
phase: X
depends_on: [TASK-0005]
traces_to: [L2-119]
estimated_context: small
---

# TASK-0174: Print stylesheet

## Goal
`@media print` hides app shell chrome, FABs, snackbars, scrims; renders content full-width with body-medium and black-on-white. Detail pages (contact, event, idea) print cleanly.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/cross-cutting/print.spec.ts`

**Scenarios (using Playwright `emulateMedia({ media: 'print' })`):**
1. On contact detail, the top bar, drawer, footer, FAB are not visible in print snapshot.
2. Body text is black on white; tag chips render with text only (no backgrounds).
3. PDF export contains the contact's basic info readable.

## Definition of Done
- [ ] Print snapshot reviewed visually for 3 detail pages.
