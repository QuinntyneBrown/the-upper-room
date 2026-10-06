A loading placeholder that sketches the shape of a list before its data arrives. `tar-skeleton` is a plain layout component (no Material primitive): a grid of `rowCount` (default 5) shimmering rows, each `rowHeight` px tall (default 56, one list row).

Each row is a `.tar-skeleton__row` with a gradient of the `surface-container-low`/`-high` roles animated left to right; under `prefers-reduced-motion: reduce` the shimmer stops and rows are a flat `surface-container-high`. It renders no `data-testid` and no ARIA attributes.
