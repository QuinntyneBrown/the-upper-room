---
id: TASK-0101
title: Idea detail + Markdown editor
status: Completed
phase: I
depends_on: [TASK-0100]
traces_to: [L2-050, L2-051]
estimated_context: medium
---

# TASK-0101: Idea detail + editor

## Goal
`/ideas/:id` with hero (cover image full-width up to 360px), title, proposer + date, vote button, action buttons. Markdown editor with toolbar (bold, italic, link, list, heading, code, image upload), live preview tab, char count (max 10000), image uploads to `/api/v1/uploads` (5 MB max for ideas — 10 MB for boards).

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/ideas/idea-detail-editor.spec.ts`

**Page Objects:** `pages/IdeaDetailPage.ts`, `components/MarkdownEditor.ts`.

**Scenarios:**
1. Idea detail page renders sanitized HTML body with the cover image.
2. Editor: bold toolbar wraps selection in `**...**`; preview tab renders bolded.
3. Image upload of 11MB rejected with "Image is too large (max 10MB). Try a smaller image.".
4. Type past 10000 chars → input rejects further keys; counter turns error.
