---
id: TASK-0073
title: Partner edit
status: Draft
phase: P
depends_on: [TASK-0071]
traces_to: [L2-037]
estimated_context: small
---

# TASK-0073: Partner edit

## Goal
`/partners/:id/edit` reuses TASK-0071 form pre-populated; PUT updates with optimistic concurrency.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/partners/partner-edit.spec.ts`

**Scenarios:**
1. Edit name → detail reflects change; success snackbar.
2. Edit description (markdown) → renders sanitized HTML on detail.
