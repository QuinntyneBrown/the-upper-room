---
id: TASK-0196
title: Extract tag-selector to domain library
status: Completed
phase: X
depends_on: [TASK-0053]
traces_to: []
estimated_context: small
---

# TASK-0196: Extract tag-selector to domain library

## Goal

Move `tag-selector` from `src/app/tags/tag-selector/` into the `domain` library and rename its selector to `tar-tag-selector`. The component is used by Contacts, Ideas, and Partners — making it a cross-cutting domain component that should live outside any single feature folder.

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
- `frontend/projects/the-upper-room/e2e/tests/tags/tag-selector-via-library.spec.ts`

**Page Objects required (create or extend):**
- `components/TagSelector.ts` — existing POM; verify it still works after the move.

**Scenarios:**
1. **Tag selector renders on contact form** — Given the contact create/edit form is open, when the tag selector field is visible, then it loads and displays available tags (no regression).
2. **Tag selection is persisted** — Given tags are displayed, when a tag is selected and the form is saved, then the contact is saved with the selected tag.

### Unit / Integration

- Frontend: `domain/src/lib/tags/tar-tag-selector.spec.ts` — covering tag loading, chip display, and remove functionality.

## Implementation Outline

- **Move:** `src/app/tags/tag-selector/` → `frontend/projects/domain/src/lib/tags/tag-selector/`
- **Rename selector:** `app-tag-selector` → `tar-tag-selector`. Update all usages (contact-create, contact-edit, idea-detail, partner forms).
- **Export:** Add `TarTagSelector` to `domain/public-api.ts`. Register in `provideDomain()`.
- **App:** Update all consumer components to import `TarTagSelector` from `domain`. Remove the old `src/app/tags/tag-selector/` folder.

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
- [ ] `TarTagSelector` exported from `domain/public-api.ts` with selector `tar-tag-selector`.
- [ ] All consumer imports updated to import from `domain`.
- [ ] `src/app/tags/tag-selector/` folder deleted.
- [ ] Status updated to `Done` in the task frontmatter.

## Out of Scope

- Adding tag creation inline from the selector (separate task).
- Moving `tag-list` (tag admin CRUD page) — it stays in the app as a feature page.
