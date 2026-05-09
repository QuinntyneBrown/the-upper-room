---
id: TASK-0225
title: Persist Ideas, votes, and idea-partner links in database
status: Accepted
phase: P
depends_on: []
traces_to: []
estimated_context: medium
---

# TASK-0225: Persist Ideas, votes, and idea-partner links

## Goal

Replace the static `_store`, `_votes`, and `_ideaPartners` lists in `TheUpperRoom.Api/Ideas/IdeasController.cs` (lines 31-33) with EF Core persistence.

## ATDD Process — REQUIRED

1. Write failing tests first.
2. Confirm meaningful failures.
3. Implement the radically simplest persistence path.

## Acceptance Tests

### Backend Integration

**Spec file(s):**
- `backend/tests/TheUpperRoom.Api.Tests/Ideas/IdeasPersistenceTests.cs`

**Scenarios:**
1. Idea creation survives a host restart.
2. Vote counts survive a host restart.
3. Idea-partner links survive a host restart.
4. Status transitions persist (`new` → `accepted` → `archived`).

### Playwright E2E

- Existing ideas e2e specs continue to pass.

## Implementation Outline

- Add `Idea`, `IdeaVote`, `IdeaPartner` entities + DbSets on `AppDbContext`.
- EF migration.
- Swap controller reads/writes to DbContext queries.

## Definition of Done

- [ ] All listed tests pass.
- [ ] No static `_store`, `_votes`, or `_ideaPartners` remain in `IdeasController.cs`.
- [ ] Status updated to `Done`.

## Out of Scope

- Vote weighting or new ranking algorithms.
