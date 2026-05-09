---
id: TASK-0191
title: Extract MarkdownEditor to components library
status: Completed
phase: X
depends_on: [TASK-0101]
traces_to: []
estimated_context: small
---

# TASK-0191: Extract MarkdownEditor to components library

## Goal

Move the markdown editor component from `src/app/ideas/markdown-editor/` into the `components` library and rename its selector to `tar-markdown-editor`. This makes the editor available to any future feature that needs rich-text authoring (Ideas, Notes, Events, etc.) without duplicating code.

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
- `frontend/projects/the-upper-room/e2e/tests/ideas/markdown-editor-via-library.spec.ts`

**Page Objects required (create or extend):**
- `components/MarkdownEditor.ts` — existing POM; verify it still works after the move

**Scenarios:**
1. **Editor renders after move** — Given the idea detail page is open, when the editor is displayed, then the write/preview tabs and formatting toolbar are visible (no regression).
2. **Preview tab renders markdown** — Given the editor contains `**bold**`, when the Preview tab is clicked, then bold text is rendered in the preview pane.

### Unit / Integration

- Frontend: `components/src/lib/markdown-editor/tar-markdown-editor.spec.ts` — covering `value` two-way binding and `maxLength` enforcement.

## Implementation Outline

- **Move:** `src/app/ideas/markdown-editor/` → `frontend/projects/components/src/lib/markdown-editor/`
- **Rename selector:** `app-markdown-editor` → `tar-markdown-editor`. Update all usages in the app.
- **Export:** Add `TarMarkdownEditor` to `components/public-api.ts`. Register in `provideTarComponents()` if any providers are needed.
- **App:** Update `idea-detail` and any other consumer to import `TarMarkdownEditor` from `components`. Remove the now-empty `ideas/markdown-editor/` folder.
- **No logic changes:** All `@Input`/`@Output` signatures stay identical.

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
- [ ] `TarMarkdownEditor` exported from `components/public-api.ts` with selector `tar-markdown-editor`.
- [ ] The `src/app/ideas/markdown-editor/` folder is deleted.
- [ ] Status updated to `Done` in the task frontmatter.

## Out of Scope

- Changing the editor's feature set (toolbar buttons, preview rendering).
- Image upload refactoring (upload URL stays a configurable `@Input`).
