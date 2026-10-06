A Kanban board (`/boards/:id`, user guide section 7) in its default Columns view. Columns hold cards; cards move between columns by drag and drop on desktop and through the card dialog's Move sheet on phones.

- **Header**: `tar-page-header` with the board name, its description as `subtitle`, and an outlined "Configure" `tar-button`.
- **Filters**: one selectable `tar-chip` per board tag in a `role="group"` labelled "Tag filters", plus "Show archived". Tags combine as any-match.
- **Columns** sit side by side and scroll horizontally. Each is a `<section>` on `surface-container-low` with an `<h2>` name and a count: `n`, or `n / limit` when a WIP limit is set. A column over its limit is outlined and counted in `--md-sys-color-error` and carries `data-over-limit="true"`. Each column ends with a text `tar-button` "Add card".
- **Cards** are outlined `[interactive]` `tar-card`s (Enter or click opens the card dialog): title, tags as `tar-chip`s in a `tar-chip-set`, the assignee's `tar-avatar` (24px) and name, and the due date with a `tar-icon`. Overdue dates switch to the error colour and say "Overdue"; archived cards are dimmed with an "Archived" chip.
- **States**: `tar-skeleton` per column while loading; a `tar-banner severity="warning"` above the board when a column is over its limit.

Stable hooks mirror the app's board view: `board-view-columns`, `board-column-<name>`, `board-card-<title>`, `board-tag-filter-<tag>`, `board-show-archived`, `board-column-add-card-<name>`.
