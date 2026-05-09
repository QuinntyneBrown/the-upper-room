---
id: TASK-0224
title: Persist Events and RSVPs in database
status: Done
phase: P
depends_on: []
traces_to: []
estimated_context: medium
---

# TASK-0224: Persist Events and RSVPs in database

## Goal

Replace the static in-memory event store in `TheUpperRoom.Api/Events/EventsController.cs` (lines 27-38, including the seeded `e-seed` "City Prayer Night" event) and the `_rsvps` static list in `TheUpperRoom.Api/Events/EventRsvpController.cs:15` with EF Core persistence.

## ATDD Process — REQUIRED

1. Write failing tests first.
2. Confirm meaningful failures.
3. Implement the radically simplest persistence path.

## Acceptance Tests

### Backend Integration

**Spec file(s):**
- `backend/tests/TheUpperRoom.Api.Tests/Events/EventsPersistenceTests.cs`

**Scenarios:**
1. Creating an event survives a host restart.
2. The `e-seed` "City Prayer Night" record does NOT appear after restart unless it was explicitly created via the API.
3. RSVPs persist across restart.
4. Capacity / waitlist behavior is preserved (existing tests still pass).
5. Cancelling a recurring event persists the cancelled occurrences.

### Playwright E2E

- Existing events and RSVP e2e specs continue to pass.

## Implementation Outline

- Add `Event` and `EventRsvp` entities + DbSets on `AppDbContext`.
- EF migration covering both tables and their relationships.
- Swap controller reads/writes from static lists to DbContext queries.
- Delete the static `Store`, `_rsvps`, and the hardcoded `e-seed` initializer.

## Definition of Done

- [ ] All listed tests pass.
- [ ] `grep -n "e-seed\|City Prayer Night" backend/src` returns no matches.
- [ ] No static `List<Event>` or `List<EventRsvp>` remains in production source.
- [ ] Status updated to `Done`.

## Out of Scope

- Recurrence engine redesign — preserve existing behavior.
- Migrating data from prior in-memory runs (no production users).
