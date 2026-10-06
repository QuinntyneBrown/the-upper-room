Switches between sections of one entity — a contact's overview and notes, a partner's events and locations. `tar-tabs` wraps Angular Material's `mat-tab-group` and renders one `mat-tab` per entry in `tabs` (`TarTab`: `id`, `label`, optional `disabled`).

Panel content comes from a single `<ng-template let-tab>` projected into the component; it is rendered lazily (`matTabContent`) with the current `TarTab` as `$implicit`, so branch on `tab.id`. The `mat-tab-group` carries `.tar-tabs` and `data-testid` from `testId`; each panel is wrapped in `.tar-tabs__panel` with `data-testid="{testId}-panel-{tab.id}"`, and after first render each tab header gets `data-testid="{testId}-tab-{tab.id}"`.

`selectedIndex` is passed to the group and `selectedIndexChange` re-emits Material's event. The `color` input is passed through but has no visible effect under the Material 3 theme.
