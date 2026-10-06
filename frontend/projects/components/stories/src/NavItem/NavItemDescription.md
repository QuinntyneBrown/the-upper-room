One destination in the app's navigation. `tar-nav-item` renders an Angular Material `mat-list-item` with a leading `mat-icon`; it is the row used inside `tar-side-nav`.

With `routerLink` set it renders `<a mat-list-item [routerLink]>`; without it, a `<button type="button" mat-list-item>`. Either element carries `.tar-nav-item` (plus `.tar-nav-item--active` when `active`), `testId` is mirrored to `data-testid`, and a click emits `clicked` with the `MouseEvent`. Inside: an optional `mat-icon.tar-nav-item__icon` (`matListItemIcon`), the required `label` in `.tar-nav-item__label` (`matListItemTitle`), and, when `badge` is not `null`, `.tar-nav-item__badge` (`matListItemMeta`).

`active` is an input, not derived from the router — the shell decides which item is current. In Storybook the links resolve against the preview's hash router.

The MDC list-item styles ship with Material's list container, so render nav items inside one — the stories wrap them in `<tar-list [role]="null">` inside a `<nav>`. A `tar-nav-item` with no list ancestor on the page renders as an unstyled link.
