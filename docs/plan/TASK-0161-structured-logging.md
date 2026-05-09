---
id: TASK-0161
title: Structured logging (Serilog) + correlation propagation
status: Accepted
phase: Au
depends_on: [TASK-0007, TASK-0033]
traces_to: [L2-097]
estimated_context: small
---

# TASK-0161: Logging

## Goal
Serilog JSON sink with the prescribed fields. Middleware reads `X-Correlation-Id` (set by frontend interceptor) and pushes into log scope. Sensitive fields scrubbed.

## Acceptance Tests

### Backend Integration
- `LoggingScrubberTests.cs` — log entries do NOT contain `password`, `token`, `secret`, `code_verifier`, `Authorization`, `Cookie`.
- `CorrelationPropagationTests.cs` — every log emitted during a request has the same `correlationId`.

### Playwright E2E (smoke)
- Test triggers an API call and reads the test sink to confirm a correlated trail exists for that ID.

## Definition of Done
- [ ] No PII or secret in any log.
