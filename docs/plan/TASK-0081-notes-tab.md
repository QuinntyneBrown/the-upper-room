---
id: TASK-0081
title: Notes tab component (composer + list)
status: Accepted
phase: N
depends_on: [TASK-0080, TASK-0065]
traces_to: [L2-042]
estimated_context: medium
---

# TASK-0081: Notes tab

## Goal
Reusable `<tar-notes [subjectType] [subjectId]>` rendered on Contact, Partner, Idea, Event Notes tabs. Composer (multi-line, "Cmd+Enter to save"), newest-first list, edit/delete (author or admin), relative time with absolute fallback at >7 days.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/notes/notes-tab.spec.ts`

**Page Object:** `components/NotesTab.ts` (`composer()`, `submitButton()`, `note(index)`).

**Scenarios:**
1. On contact detail Notes tab, write "Hello world" and submit → note appears at the top with author + "just now".
2. Note shorter than 2 chars → helper "Notes must be at least 2 characters."; composer keeps focus.
3. Edit note → form replaces body; save updates the rendered HTML.
4. Author can delete own note; non-author Member cannot see Delete.
5. Note from 8 days ago shows absolute date "Mar 5, 2026".
