---
id: TASK-0232
title: Replace InMemorySink with a real structured logging sink
status: Accepted
phase: P
depends_on: []
traces_to: []
estimated_context: small
---

# TASK-0232: Replace InMemorySink

## Goal

Remove `TheUpperRoom.Api/Logging/InMemorySink.cs` (line 9 — static `Events` list capturing all log events) and the API surface that exposes it. Replace with a structured logging configuration writing to console + file (or whatever existing structured sink is configured), and remove the captured-events list entirely.

## ATDD Process — REQUIRED

1. Write failing tests first.
2. Confirm meaningful failures.
3. Make them green with the radically simplest replacement.

## Acceptance Tests

### Backend Integration

**Spec file(s):**
- `backend/tests/TheUpperRoom.Api.Tests/Logging/StructuredLoggingTests.cs`

**Scenarios:**
1. `InMemorySink` does not exist in `backend/src`.
2. Log calls from a controller produce structured records on the configured sink (capture via a test-only in-process sink registered ONLY in the test environment, never in `Program.cs`).
3. No public API exposes captured log events.

## Implementation Outline

- Delete `InMemorySink.cs`.
- Configure structured logging (`Microsoft.Extensions.Logging` with JSON console formatter, or existing Serilog setup) in `Program.cs`.
- Update tests that previously asserted against `InMemorySink.Events` to use a test-scoped in-process sink registered only in the test factory.

## Definition of Done

- [ ] All listed tests pass.
- [ ] `grep -rn "InMemorySink" backend/src` returns no matches.
- [ ] Status updated to `Done`.

## Out of Scope

- Choosing or wiring an external log aggregator (Datadog, Seq, etc.).
