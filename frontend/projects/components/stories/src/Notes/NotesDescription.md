A notes panel for a contact, partner, idea or event. `tar-notes` is a self-contained feature component: give it `subjectType` and `subjectId` (both required) and it loads `GET /api/v1/users/me` and `GET /api/v1/notes?subjectType=…&subjectId=…` through `HttpClient`, then creates (`POST /api/v1/notes`), edits (`PUT /api/v1/notes/{id}`) and deletes (`DELETE /api/v1/notes/{id}`) notes itself. It has no outputs. These stories provide an in-memory `HttpClient` stub.

It renders plain elements styled with `--md-sys-*` tokens (no Material form fields). The root `.notes` contains:

- `.notes__composer` — a `.notes__textarea` (`data-testid="notes-composer"`; Cmd/Ctrl+Enter saves), an error `.notes__error` (`data-testid="notes-composer-error"`) for notes under 2 characters, and a `.notes__btn-primary` Save (`data-testid="notes-submit"`).
- `.notes__list` of `.notes__item` (`data-testid="notes-item"`), each with `.notes__author` (`note-author`), `.notes__time` (`note-time`), the server-sanitised HTML body `.notes__body` (`note-body`), and `.notes__btn-text` actions: History (`note-history-button`, when the note has history), Edit (`note-edit-button`) and Delete (`note-delete-button`, `.notes__btn-text--danger`) for the author or a `SystemAdmin`. An empty list shows `.notes__empty`.
- Editing replaces the item with `.notes__edit-form` (`note-edit-form`), its textarea (`note-edit-input`) and Save (`note-save-button`) / Cancel.

History opens the internal `NoteHistoryDialog` with `MatDialog` (`data-testid="note-history-dialog"`, `note-history-version`, `note-history-preview`, `note-history-close`). Deleting confirms with the snackbar "Note deleted".
