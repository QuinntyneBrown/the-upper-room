---
id: TASK-0226
title: Persist Notes in database
status: Done
phase: P
depends_on: []
traces_to: []
estimated_context: small
---

# TASK-0226: Persist Notes in database

## Goal

Replace the static `_store` in `TheUpperRoom.Api/Notes/NotesController.cs:13` with EF Core persistence.

## ATDD Process — REQUIRED

1. Write failing tests first.
2. Confirm meaningful failures.
3. Implement the radically simplest persistence path.

## Acceptance Tests

### Backend Integration

**Spec file(s):**
- `backend/tests/TheUpperRoom.Api.Tests/Notes/NotesPersistenceTests.cs`

**Scenarios:**
1. Notes survive a host restart.
2. Notes are correctly scoped to their `subjectType` + `subjectId`.
3. Edit history (if currently in-memory) persists correctly.

### Playwright E2E

- Existing notes e2e specs continue to pass.

## Implementation Outline

- Add `Note` entity and `DbSet<Note>` on `AppDbContext`.
- EF migration.
- Swap controller reads/writes to DbContext queries.

## Definition of Done

- [ ] All listed tests pass.
- [ ] No static `_store` remains in `NotesController.cs`.
- [ ] Status updated to `Done`.

## Out of Scope

- Changing the notes UI or markdown handling.
