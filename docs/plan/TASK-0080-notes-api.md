---
id: TASK-0080
title: Note data model + API + Markdown sanitization
status: Accepted
phase: N
depends_on: [TASK-0033]
traces_to: [L2-041, L2-093]
estimated_context: medium
---

# TASK-0080: Notes API

## Goal
Persist notes (`subjectType`, `subjectId`, body markdown + sanitized HTML), keep up to 20 prior versions in `NoteVersions`, expose CRUD endpoints. Server-side HTML sanitization via Ganss.Xss.

## Acceptance Tests

### Backend Integration

**File:** `TheUpperRoom.Application.Tests/NotesTests.cs`

**Scenarios:**
1. Create note with body `<script>alert(1)</script>foo` → stored sanitized HTML has no `script` element; raw markdown preserved.
2. Update note → previous version copied to `NoteVersions`; up to 20 retained.
3. Delete note → cascade removes versions.

### Playwright E2E (sanity)

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/notes/notes-api.spec.ts`

**Scenario:** A test page calls the API directly and asserts sanitization.

## Definition of Done
- [ ] Sanitizer config matches an allow-list (paragraphs, headers, lists, links, code, em, strong, blockquote).
