---
id: TASK-0153
title: Email channel for notifications
status: Completed
phase: No
depends_on: [TASK-0150]
traces_to: [L2-063]
estimated_context: small
---

# TASK-0153: Email channel

## Goal
Email channel sends from `notifications@<domain>` via the configured SMTP/SES provider. Templates per code with subject + body; in dev, write to disk under `var/mail/`.

## Acceptance Tests

### Backend Integration
- `EmailDispatcherTests.cs` — every L2-063 code has a template; rendered template includes user-data tokens.
- Disabled email channel for a code skips send.

### Playwright E2E (smoke)
- Test reads from `var/mail/` after dispatching `welcome` to verify the file was written with subject "Welcome to The Upper Room!".

## Definition of Done
- [ ] No PII logged in dispatch logs.
