---
id: TASK-0100
title: Idea data model + API + list with vote
status: Completed
phase: I
depends_on: [TASK-0033, TASK-0010]
traces_to: [L2-048, L2-049]
estimated_context: medium
---

# TASK-0100: Ideas list + voting

## Goal
Persist Idea + IdeaVote + IdeaPartner (link). Render `/ideas` responsive grid (XS 1, MD 2, LG 3) with vote toggle (heart icon, optimistic UI), filters (Status, Partner, Tag, "My ideas") and sort (Most votes, Newest, Updated).

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/ideas/idea-list-vote.spec.ts`

**Page Object:** `pages/IdeasListPage.ts`.

**Scenarios:**
1. Empty `/ideas` shows icon `lightbulb` empty state.
2. Click heart on idea → optimistic increment with `0.95→1.0` scale animation; persists.
3. Second click removes vote → snackbar "Vote removed" (info, 4s).
4. Filter "My ideas" returns only those proposed by the current user.
5. Sort "Most votes" orders by vote count desc.
