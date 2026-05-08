---
id: TASK-0102
title: Idea status workflow
status: Draft
phase: I
depends_on: [TASK-0101]
traces_to: [L2-048, L2-050]
estimated_context: small
---

# TASK-0102: Idea status

## Goal
Workflow: Draft → Submitted → UnderReview → Selected → InProgress → Completed (or Archived). Proposer can submit; CityLead can change to UnderReview/Selected/etc.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/ideas/idea-status.spec.ts`

**Scenarios:**
1. Proposer on Draft idea sees primary "Submit for review" button; clicking it changes status; "Change status" disappears.
2. CityLead can change Submitted→Selected via "Change status" dropdown; idea card chip updates.
3. Status transitions invalid for the role/current state are rejected by the API with 422 (unprocessable).
