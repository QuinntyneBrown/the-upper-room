A vertical list of rows — contacts, events, cities. `tar-list` wraps Angular Material's `mat-list` and `tar-list-item` wraps `mat-list-item`; use them together.

**`tar-list`** renders `mat-list.tar-list` with a transparent background. `role` (default `list`) and `ariaLabel` are set on it as `role` and `aria-label`. Items are projected through its default slot.

**`tar-list-item`** renders a `<div mat-list-item class="tar-list-item">`, or — when `interactive` is true — an `<a mat-list-item>` that also carries `.tar-list-item--interactive` and emits `clicked` with the `MouseEvent`. `active` adds `.tar-list-item--active`. Optional parts: `icon` → `mat-icon.tar-list-item__icon` (`matListItemIcon`), `title` → `.tar-list-item__title` (`matListItemTitle`), `description` → `.tar-list-item__description` (`matListItemLine`). Extra content projects after them. `testId` is mirrored to `data-testid` on the row element.

Known limitation: Material's `MatListItem` selector is `mat-list-item, a[mat-list-item], button[mat-list-item]`, so the non-interactive `<div mat-list-item>` row is not upgraded to a Material list item — it renders without the Material list-item padding, height and icon alignment (compare _Default_ and _With Icons_ with _Interactive_). Only `interactive` rows get the full Material layout.
