---
id: TASK-XXXX
title: <imperative title>
status: Draft
phase: <F|A|R|U|CI|C|P|N|K|I|L|E|H|S|No|Au|X|Z>
depends_on: []
traces_to: []
estimated_context: small
---

# TASK-XXXX: <Title>

## Goal
One-paragraph statement of the user-visible outcome this task delivers.

## ATDD Process — REQUIRED

This task **MUST** be implemented using ATDD:

1. Create the failing tests listed below first (Playwright e2e + unit/integration where applicable).
2. Run them. Confirm each fails with a meaningful failure message — not a build/import error.
3. Write the **radically simplest** production code to flip them green. No premature abstraction.
4. Refactor only with all tests green. Never modify production code without a failing test demanding the change.
5. Do not extend scope. If a real edge case appears that isn't in this task, file a follow-up task.

## Acceptance Tests

### Playwright E2E (Page Object Model)

**Spec file(s):**
- `frontend/projects/the-upper-room/e2e/tests/<feature>/<scenario>.spec.ts`

**Page Objects required (create or extend):**
- `pages/<Name>Page.ts` — methods: `goto()`, `<otherActions>()`

**Scenarios:**
1. **<Name>** — Given <preconditions>, when <action>, then <expected observable outcome>.
2. ...

Every spec file MUST start with `// Traces to: L2-XXX` referencing the L2 ids in the frontmatter.

### Unit / Integration

- Backend: `<TestProject>` — `<TestClassName>.<MethodName>` covering <behaviour>.
- Frontend: `<file>.spec.ts` — covering <behaviour>.

## Implementation Outline

- **Backend:** projects/files affected, endpoints added, EF migration name.
- **Frontend:** components, services, routes added.
- **Wiring:** module/standalone provider registrations, lint allow-lists if any.

## Definition of Done

- [ ] All listed e2e scenarios pass on CI in headless Chromium and WebKit.
- [ ] All listed unit/integration tests pass.
- [ ] Coverage gates (L2-101) still green.
- [ ] `npm run lint`, `npm run typecheck`, `dotnet build`, `dotnet test` all green.
- [ ] Every test file added has a `// Traces to: L2-XXX` header.
- [ ] No literal user-facing strings in templates (i18n lint clean).
- [ ] No `px` margin/padding values outside the spacing token mixin (L2-003).
- [ ] No new components in single-file form (L2-081).
- [ ] BEM compliance verified by stylelint (L2-082).
- [ ] Status updated to `Done` in the task frontmatter.

## Out of Scope

Explicitly list anything related but deferred to another task, with the task ID where it lives.
