A small status descriptor attached to another element. `[tarBadge]` is an attribute directive — not a component — that applies Angular Material's `MatBadge` as a host directive and re-exposes its inputs under `tarBadge*` names:

| `tarBadge` input   | `MatBadge` input         |
| ------------------ | ------------------------ |
| `tarBadge`         | `matBadge` (the content) |
| `tarBadgePosition` | `matBadgePosition`       |
| `tarBadgeSize`     | `matBadgeSize`           |
| `tarBadgeOverlap`  | `matBadgeOverlap`        |
| `tarBadgeHidden`   | `matBadgeHidden`         |
| `tarBadgeColor`    | `matBadgeColor`          |

It adds no BEM classes or `data-testid` of its own: the host element gets Material's `.mat-badge` classes and Material appends a `.mat-badge-content` span. `tarBadgeColor` does not change the badge's appearance under the app's Material 3 theme, so it isn't shown here.
