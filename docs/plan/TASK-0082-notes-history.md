---
id: TASK-0082
title: Note edit history dialog
status: Draft
phase: N
depends_on: [TASK-0081]
traces_to: [L2-041]
estimated_context: small
---

# TASK-0082: Note history

## Goal
"History" link on each note opens a dialog listing prior versions newest-first with author and timestamp; click a version to preview.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/notes/notes-history.spec.ts`

**Page Object:** `components/NoteHistoryDialog.ts`.

**Scenarios:**
1. Note edited 3 times → 3 prior versions plus current; preview shows the selected version's HTML.
2. Member viewing another's note still sees history.
