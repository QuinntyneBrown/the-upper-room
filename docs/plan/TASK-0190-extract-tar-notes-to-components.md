---
id: TASK-0190
title: Extract TarNotes to components library
status: Completed
phase: X
depends_on: [TASK-0081]
traces_to: []
estimated_context: small
---

# TASK-0190: Extract TarNotes to components library

## Goal

Move `tar-notes` from `src/app/notes/tar-notes/` into the `components` library so that any future feature (Partners, Events, Locations, etc.) can embed a notes tab without copying code into the app.

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
- `frontend/projects/the-upper-room/e2e/tests/notes/notes-tab-via-library.spec.ts`

**Page Objects required (create or extend):**
- `components/NotesTab.ts` — existing POM; verify it still works after the move

**Scenarios:**
1. **Notes tab renders after move** — Given a contact detail page is open, when the Notes tab is selected, then the notes composer and list render correctly (no import errors, no regression).
2. **Create note via library component** — Given the notes tab is active, when a note is typed and submitted, then the new note appears in the list.

### Unit / Integration

- Frontend: `components/src/lib/notes/tar-notes.spec.ts` — covering `subjectType` + `subjectId` inputs wiring HTTP calls correctly.

## Implementation Outline

- **Move:** `src/app/notes/tar-notes/` → `frontend/projects/components/src/lib/notes/tar-notes/`
- **API library:** Add `NotesApiService` + `NotesApiContract` to `frontend/projects/api/src/lib/notes/` covering `GET /api/v1/notes`, `POST /api/v1/notes`, `PATCH /api/v1/notes/:id`, `DELETE /api/v1/notes/:id`. Export from `api/public-api.ts`.
- **Components library:** Wire `TarNotes` to inject `NotesApiService` from `api`. Export `TarNotes` from `components/public-api.ts`. Register in `provideTarComponents()` if any providers are needed.
- **App:** Replace `src/app/notes/tar-notes/` import with `import { TarNotes } from 'components'`. Remove the now-empty `notes/tar-notes/` folder and its barrel.
- **Wiring:** Update `tsconfig.json` paths if needed (should already map `components` → `dist/components`).

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
- [ ] `TarNotes` is exported from `components/public-api.ts`.
- [ ] The `src/app/notes/tar-notes/` folder is deleted.
- [ ] Status updated to `Done` in the task frontmatter.

## Out of Scope

- Moving the notes API endpoint implementation (backend stays the same).
- Adding markdown rendering to notes (separate concern).
