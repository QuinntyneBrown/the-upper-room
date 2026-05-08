---
id: TASK-0103
title: Idea cover image upload + partner linking
status: Draft
phase: I
depends_on: [TASK-0101, TASK-0070]
traces_to: [L2-051, L2-048]
estimated_context: small
---

# TASK-0103: Idea cover + partners

## Goal
Cover image upload (16:9 crop guide), 0..n partner links rendered as chips/cards on detail.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/ideas/idea-cover-partners.spec.ts`

**Scenarios:**
1. Upload 16:9 image as cover → renders on idea card and hero.
2. Link two partners → partner cards visible on detail; clicking navigates to partner detail.
3. Removing a partner link removes only the link.
