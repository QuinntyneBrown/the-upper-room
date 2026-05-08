---
id: TASK-0031
title: *tarHasPermission and *tarHasRole structural directives
status: Draft
phase: R
depends_on: [TASK-0030]
traces_to: [L2-025]
estimated_context: small
---

# TASK-0031: Permission directives

## Goal
`*tarHasPermission="'Contact:Delete'"` and `*tarHasRole="['SystemAdmin']"` structural directives that conditionally render based on the user's effective permissions.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/rbac/permission-directives.spec.ts`

**Scenario (using a test-only `/__rbac-demo` route):**
1. As Member, the demo's "Delete" button is absent from the DOM (not just hidden).
2. As SystemAdmin, the same button is present.
3. As any user, an unknown permission key produces a console warning in dev and hides content.

### Unit (frontend)
- Directive unit tests with mocked permission service.

## Definition of Done
- [ ] DOM presence (not visibility) is the assertion.
